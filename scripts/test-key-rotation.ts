/**
 * Test script for OpenRouter key rotation system
 *
 * This script tests:
 * 1. Sequential key distribution (round-robin)
 * 2. Rate limiting (50 requests per day per key)
 * 3. Bad request tracking and cooldown (3 consecutive 400s = 60 min cooldown)
 */

// Mock the key rotation logic for testing
interface KeyState {
  requestCount: number;
  lastResetTime: number;
  consecutiveBadRequests: number;
  cooldownUntil: number | null;
}

const keyStates = new Map<number, KeyState>();
const DAILY_REQUEST_LIMIT = 50;
const COOLDOWN_DURATION_MS = 60 * 60 * 1000; // 60 minutes
const BAD_REQUEST_THRESHOLD = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

let currentKeyIndex = 0;

function getKeyState(keyIndex: number): KeyState {
  if (!keyStates.has(keyIndex)) {
    keyStates.set(keyIndex, {
      requestCount: 0,
      lastResetTime: Date.now(),
      consecutiveBadRequests: 0,
      cooldownUntil: null,
    });
  }
  return keyStates.get(keyIndex)!;
}

function resetDailyCountIfNeeded(state: KeyState): void {
  const now = Date.now();
  if (now - state.lastResetTime >= DAY_MS) {
    state.requestCount = 0;
    state.lastResetTime = now;
  }
}

function isKeyAvailable(keyIndex: number): boolean {
  const state = getKeyState(keyIndex);
  const now = Date.now();

  if (state.cooldownUntil && now < state.cooldownUntil) {
    return false;
  }

  if (state.cooldownUntil && now >= state.cooldownUntil) {
    state.cooldownUntil = null;
    state.consecutiveBadRequests = 0;
  }

  resetDailyCountIfNeeded(state);
  return state.requestCount < DAILY_REQUEST_LIMIT;
}

function recordSuccessfulRequest(keyIndex: number): void {
  const state = getKeyState(keyIndex);
  resetDailyCountIfNeeded(state);
  state.requestCount++;
  state.consecutiveBadRequests = 0;
  console.log(
    `✅ Key #${keyIndex}: ${state.requestCount}/${DAILY_REQUEST_LIMIT} requests`,
  );
}

function recordBadRequest(keyIndex: number): void {
  const state = getKeyState(keyIndex);
  resetDailyCountIfNeeded(state);
  state.requestCount++;
  state.consecutiveBadRequests++;

  console.warn(
    `⚠️  Key #${keyIndex}: Bad request ${state.consecutiveBadRequests}/${BAD_REQUEST_THRESHOLD}`,
  );

  if (state.consecutiveBadRequests >= BAD_REQUEST_THRESHOLD) {
    state.cooldownUntil = Date.now() + COOLDOWN_DURATION_MS;
    console.warn(`🚫 Key #${keyIndex}: Entering 60-minute cooldown`);
  }
}

function getNextApiKey(numKeys: number): number | null {
  let attempts = 0;

  while (attempts < numKeys) {
    const index = currentKeyIndex % numKeys;
    currentKeyIndex = (currentKeyIndex + 1) % numKeys;
    attempts++;

    if (isKeyAvailable(index)) {
      return index;
    }

    const state = getKeyState(index);
    if (state.cooldownUntil && Date.now() < state.cooldownUntil) {
      const remainingMinutes = Math.ceil(
        (state.cooldownUntil - Date.now()) / (60 * 1000),
      );
      console.log(
        `⏳ Key #${index}: In cooldown for ${remainingMinutes} more minutes`,
      );
    } else if (state.requestCount >= DAILY_REQUEST_LIMIT) {
      console.log(
        `📊 Key #${index}: Daily limit reached (${state.requestCount}/${DAILY_REQUEST_LIMIT})`,
      );
    }
  }

  return null;
}

// Test scenarios
console.log("🧪 Testing OpenRouter Key Rotation System\n");

// Test 1: Sequential distribution
console.log("Test 1: Sequential Distribution (Round-Robin)");
console.log("=".repeat(50));
const numKeys = 11;
for (let i = 0; i < 15; i++) {
  const keyIndex = getNextApiKey(numKeys);
  if (keyIndex !== null) {
    console.log(`Request ${i + 1}: Using Key #${keyIndex}`);
    recordSuccessfulRequest(keyIndex);
  }
}

console.log("\n");

// Test 2: Rate limiting
console.log("Test 2: Rate Limiting (50 requests per day)");
console.log("=".repeat(50));
// Simulate 50 requests on key 0
for (let i = 0; i < 52; i++) {
  const state = getKeyState(0);
  if (state.requestCount < DAILY_REQUEST_LIMIT) {
    recordSuccessfulRequest(0);
  } else {
    console.log(`🛑 Key #0: Rate limit reached, cannot make more requests`);
    break;
  }
}

console.log("\n");

// Test 3: Bad request tracking and cooldown
console.log("Test 3: Bad Request Tracking and Cooldown");
console.log("=".repeat(50));
// Reset key 1 for this test
keyStates.delete(1);
console.log("Simulating 3 consecutive bad requests on Key #1:");
for (let i = 0; i < 3; i++) {
  recordBadRequest(1);
}

console.log("\nTrying to use Key #1 after cooldown:");
const keyAfterCooldown = getNextApiKey(numKeys);
if (keyAfterCooldown === 1) {
  console.log("❌ ERROR: Key #1 should be in cooldown!");
} else {
  console.log(
    `✅ Correctly skipped Key #1 (in cooldown), using Key #${keyAfterCooldown}`,
  );
}

console.log("\n");

// Test 4: Cooldown expiration
console.log("Test 4: Cooldown Expiration");
console.log("=".repeat(50));
const state1 = getKeyState(1);
// Simulate cooldown expiration by setting it to the past
state1.cooldownUntil = Date.now() - 1000;
console.log("Simulating cooldown expiration for Key #1");
const keyAfterExpiration = getNextApiKey(numKeys);
console.log(`Key after expiration check: #${keyAfterExpiration}`);

console.log("\n");

// Test 5: All keys exhausted
console.log("Test 5: All Keys Exhausted");
console.log("=".repeat(50));
// Max out all keys
for (let i = 0; i < numKeys; i++) {
  const state = getKeyState(i);
  state.requestCount = DAILY_REQUEST_LIMIT;
}
const noKeyAvailable = getNextApiKey(numKeys);
if (noKeyAvailable === null) {
  console.log("✅ Correctly returned null when all keys are exhausted");
} else {
  console.log(`❌ ERROR: Should return null, but got Key #${noKeyAvailable}`);
}

console.log("\n");
console.log("✅ All tests completed!");
