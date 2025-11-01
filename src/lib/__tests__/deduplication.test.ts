/**
 * Unit Tests - Deduplication Logic
 *
 * Tests for prompt deduplication:
 * - generatePromptHash function
 * - generateImageHash function
 * - Hash consistency and collision resistance
 */

import { describe, it, expect } from "vitest";
import { generatePromptHash, generateImageHash } from "../deduplication";

describe("generatePromptHash", () => {
  describe("Basic Hash Generation", () => {
    it("should generate a consistent hash for the same prompt", () => {
      const prompt = "Create a PDF about testing";

      const hash1 = generatePromptHash(prompt);
      const hash2 = generatePromptHash(prompt);

      expect(hash1).toBe(hash2);
      expect(hash1).toBeDefined();
      expect(typeof hash1).toBe("string");
      expect(hash1.length).toBeGreaterThan(0);
    });

    it("should generate different hashes for different prompts", () => {
      const prompt1 = "Create a PDF about testing";
      const prompt2 = "Create a PDF about development";

      const hash1 = generatePromptHash(prompt1);
      const hash2 = generatePromptHash(prompt2);

      expect(hash1).not.toBe(hash2);
    });

    it("should handle empty prompts", () => {
      const hash = generatePromptHash("");

      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
    });

    it("should handle very long prompts", () => {
      const longPrompt = "A".repeat(10000);

      const hash = generatePromptHash(longPrompt);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
    });
  });

  describe("Case Insensitivity", () => {
    it("should generate same hash for different cases", () => {
      const prompt1 = "Create a PDF about TESTING";
      const prompt2 = "create a pdf about testing";

      const hash1 = generatePromptHash(prompt1);
      const hash2 = generatePromptHash(prompt2);

      expect(hash1).toBe(hash2);
    });

    it("should normalize whitespace in prompts", () => {
      const prompt1 = "  Create a PDF about testing  ";
      const prompt2 = "Create a PDF about testing";

      const hash1 = generatePromptHash(prompt1);
      const hash2 = generatePromptHash(prompt2);

      expect(hash1).toBe(hash2);
    });
  });

  describe("User-Specific Hashing", () => {
    it("should generate different hashes for different users with same prompt", () => {
      const prompt = "Create a PDF about testing";
      const userId1 = "user1";
      const userId2 = "user2";

      const hash1 = generatePromptHash(prompt, { userId: userId1 });
      const hash2 = generatePromptHash(prompt, { userId: userId2 });

      expect(hash1).not.toBe(hash2);
    });

    it("should generate different hash with and without userId", () => {
      const prompt = "Create a PDF about testing";
      const userId = "user1";

      const hashWithUser = generatePromptHash(prompt, { userId });
      const hashWithoutUser = generatePromptHash(prompt);

      expect(hashWithUser).not.toBe(hashWithoutUser);
    });

    it("should handle null userId", () => {
      const prompt = "Create a PDF about testing";

      const hash1 = generatePromptHash(prompt, { userId: null });
      const hash2 = generatePromptHash(prompt);

      expect(hash1).toBe(hash2);
    });
  });

  describe("Tier-Specific Hashing", () => {
    it("should generate different hashes for different tiers", () => {
      const prompt = "Create a PDF about testing";

      const starterHash = generatePromptHash(prompt, { tier: "starter" });
      const proHash = generatePromptHash(prompt, { tier: "professional" });

      expect(starterHash).not.toBe(proHash);
    });

    it("should use default tier when not specified", () => {
      const prompt = "Create a PDF about testing";

      const hash1 = generatePromptHash(prompt);
      const hash2 = generatePromptHash(prompt, { tier: "starter" });

      expect(hash1).toBe(hash2);
    });
  });

  describe("Image-Aware Hashing", () => {
    it("should generate different hash when including image", () => {
      const prompt = "Create a PDF about testing";
      const imageHash = "abc123";

      const hashWithoutImage = generatePromptHash(prompt);
      const hashWithImage = generatePromptHash(prompt, {
        includeImage: true,
        imageHash,
      });

      expect(hashWithoutImage).not.toBe(hashWithImage);
    });

    it("should generate different hashes for different image hashes", () => {
      const prompt = "Create a PDF about testing";

      const hash1 = generatePromptHash(prompt, {
        includeImage: true,
        imageHash: "image1",
      });
      const hash2 = generatePromptHash(prompt, {
        includeImage: true,
        imageHash: "image2",
      });

      expect(hash1).not.toBe(hash2);
    });

    it("should ignore imageHash when includeImage is false", () => {
      const prompt = "Create a PDF about testing";

      const hash1 = generatePromptHash(prompt, {
        includeImage: false,
        imageHash: "image1",
      });
      const hash2 = generatePromptHash(prompt, {
        includeImage: false,
        imageHash: "image2",
      });

      expect(hash1).toBe(hash2);
    });
  });

  describe("Special Characters", () => {
    it("should handle prompts with special characters", () => {
      const prompts = [
        "Create a PDF with émojis: 😀🎉",
        "Create a PDF with symbols: @#$%^&*()",
        "Create a PDF with line\nbreaks",
        "Create a PDF with tabs\there",
      ];

      prompts.forEach((prompt) => {
        const hash = generatePromptHash(prompt);
        expect(hash).toBeDefined();
        expect(typeof hash).toBe("string");
        expect(hash.length).toBeGreaterThan(0);
      });
    });

    it("should handle Unicode characters", () => {
      const prompt = "إنشاء PDF باللغة العربية"; // Arabic text

      const hash = generatePromptHash(prompt);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
    });
  });
});

describe("generateImageHash", () => {
  describe("String Input", () => {
    it("should generate consistent hash for string input", () => {
      const imageData = "sample image data";

      const hash1 = generateImageHash(imageData);
      const hash2 = generateImageHash(imageData);

      expect(hash1).toBe(hash2);
      expect(hash1).toBeDefined();
      expect(typeof hash1).toBe("string");
    });

    it("should generate different hashes for different strings", () => {
      const imageData1 = "image1";
      const imageData2 = "image2";

      const hash1 = generateImageHash(imageData1);
      const hash2 = generateImageHash(imageData2);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe("Uint8Array Input", () => {
    it("should generate hash for Uint8Array", () => {
      const imageData = new Uint8Array([1, 2, 3, 4, 5]);

      const hash = generateImageHash(imageData);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
    });

    it("should generate consistent hash for same Uint8Array", () => {
      const imageData = new Uint8Array([1, 2, 3, 4, 5]);

      const hash1 = generateImageHash(imageData);
      const hash2 = generateImageHash(imageData);

      expect(hash1).toBe(hash2);
    });

    it("should generate different hashes for different Uint8Arrays", () => {
      const imageData1 = new Uint8Array([1, 2, 3]);
      const imageData2 = new Uint8Array([4, 5, 6]);

      const hash1 = generateImageHash(imageData1);
      const hash2 = generateImageHash(imageData2);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty input", () => {
      const hash = generateImageHash("");

      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
    });

    it("should handle empty Uint8Array", () => {
      const imageData = new Uint8Array([]);

      const hash = generateImageHash(imageData);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
    });

    it("should handle large binary data", () => {
      const largeData = new Uint8Array(10000).fill(255);

      const hash = generateImageHash(largeData);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
    });
  });

  describe("Hash Collision Resistance", () => {
    it("should generate different hashes for similar but different data", () => {
      const data1 = new Uint8Array([1, 2, 3, 4, 5]);
      const data2 = new Uint8Array([1, 2, 3, 4, 6]); // Last byte different

      const hash1 = generateImageHash(data1);
      const hash2 = generateImageHash(data2);

      expect(hash1).not.toBe(hash2);
    });

    it("should generate unique hashes for incrementing values", () => {
      const hashes = new Set<string>();

      for (let i = 0; i < 100; i++) {
        const data = new Uint8Array([i]);
        const hash = generateImageHash(data);
        hashes.add(hash);
      }

      // All hashes should be unique
      expect(hashes.size).toBe(100);
    });
  });
});

describe("Hash Integration", () => {
  it("should combine prompt and image hashes correctly", () => {
    const prompt = "Create a PDF with image";
    const imageData = "sample image";
    const imageHash = generateImageHash(imageData);

    const hashWithImage = generatePromptHash(prompt, {
      includeImage: true,
      imageHash,
    });

    expect(hashWithImage).toBeDefined();
    expect(typeof hashWithImage).toBe("string");
  });

  it("should create unique combined hashes", () => {
    const prompt1 = "Prompt 1";
    const prompt2 = "Prompt 2";
    const image1 = "Image 1";
    const image2 = "Image 2";

    const hash1 = generatePromptHash(prompt1, {
      includeImage: true,
      imageHash: generateImageHash(image1),
    });

    const hash2 = generatePromptHash(prompt2, {
      includeImage: true,
      imageHash: generateImageHash(image2),
    });

    expect(hash1).not.toBe(hash2);
  });
});
