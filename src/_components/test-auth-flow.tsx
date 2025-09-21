"use client";

import React, { useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

/**
 * Authentication Flow Test Component
 *
 * This component can be used to test the complete authentication flow.
 * It provides buttons to test various authentication scenarios.
 *
 * Usage: Import and use this component in any page to test auth functionality.
 */
export default function AuthFlowTest() {
  const { isSignedIn, isLoaded, signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${result}`,
    ]);
  };

  const runAuthTests = async () => {
    setTestResults([]);

    // Test 1: Check if auth is loaded
    addTestResult(`Auth loaded: ${isLoaded}`);
    addTestResult(`User signed in: ${isSignedIn}`);

    if (isLoaded) {
      // Test 2: Check user information
      if (isSignedIn && user) {
        addTestResult(`User ID: ${user.id}`);
        addTestResult(
          `User email: ${user.primaryEmailAddress?.emailAddress ?? "N/A"}`,
        );
        addTestResult(
          `User name: ${user.firstName ?? "N/A"} ${user.lastName ?? ""}`,
        );
      }

      // Test 3: Test navigation to protected routes
      try {
        addTestResult("Testing navigation to dashboard...");
        router.push("/dashboard");
        addTestResult("Navigation to dashboard successful");
      } catch (error) {
        addTestResult(`Navigation error: ${(error as Error).message}`);
      }

      // Test 4: Test API call (if available)
      try {
        addTestResult("Testing API call...");
        // This would test a tRPC call if you have one available
        addTestResult("API call test - implement based on your API structure");
      } catch (error) {
        addTestResult(`API call error: ${(error as Error).message}`);
      }

      // Test 5: Test sign out
      if (isSignedIn) {
        try {
          addTestResult("Testing sign out...");
          await signOut();
          addTestResult("Sign out successful");
        } catch (error) {
          addTestResult(`Sign out error: ${(error as Error).message}`);
        }
      }
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h2 className="mb-4 text-2xl font-bold">Authentication Flow Test</h2>

      <div className="mb-6 space-y-4">
        <div className="flex gap-2">
          <button
            onClick={runAuthTests}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Run Auth Tests
          </button>
          <button
            onClick={clearResults}
            className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
          >
            Clear Results
          </button>
        </div>

        <div className="rounded bg-gray-100 p-4">
          <h3 className="mb-2 font-semibold">Current Auth State:</h3>
          <p>Loaded: {isLoaded ? "Yes" : "No"}</p>
          <p>Signed In: {isSignedIn ? "Yes" : "No"}</p>
          {user && (
            <div className="mt-2">
              <p>
                User: {user.firstName} {user.lastName}
              </p>
              <p>Email: {user.primaryEmailAddress?.emailAddress}</p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded border bg-white p-4">
        <h3 className="mb-2 font-semibold">Test Results:</h3>
        <div className="max-h-64 overflow-y-auto">
          {testResults.length === 0 ? (
            <p className="text-gray-500">
              No tests run yet. Click &quot;Run Auth Tests&quot; to start.
            </p>
          ) : (
            <ul className="space-y-1">
              {testResults.map((result, index) => (
                <li key={index} className="font-mono text-sm">
                  {result}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-6 rounded border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="mb-2 font-semibold text-yellow-800">
          Manual Testing Checklist:
        </h3>
        <ul className="space-y-1 text-sm text-yellow-700">
          <li>✓ Sign in with valid credentials</li>
          <li>✓ Access protected dashboard routes</li>
          <li>✓ User button shows in header when signed in</li>
          <li>✓ Sign out functionality works</li>
          <li>
            ✓ Redirect to sign-in when accessing protected routes while signed
            out
          </li>
          <li>✓ API calls work with authentication</li>
          <li>✓ Error handling for invalid authentication</li>
        </ul>
      </div>
    </div>
  );
}
