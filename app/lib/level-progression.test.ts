import { describe, it, expect } from "vitest";
import { LevelProgression } from "./level-progression";

describe("LevelProgression", () => {
  describe("getXpForLevel", () => {
    it("should return level multiplied by 100", () => {
      expect(LevelProgression.getXpForLevel(1)).toBe(100);
      expect(LevelProgression.getXpForLevel(2)).toBe(200);
      expect(LevelProgression.getXpForLevel(5)).toBe(500);
    });

    it("should default level to 1 if negative or 0 is passed", () => {
      expect(LevelProgression.getXpForLevel(0)).toBe(100);
      expect(LevelProgression.getXpForLevel(-5)).toBe(100);
    });
  });

  describe("getXpProgressPercentage", () => {
    it("should calculate correct percentage of progress inside a level", () => {
      expect(LevelProgression.getXpProgressPercentage(50, 1)).toBe(50); // 50 / 100
      expect(LevelProgression.getXpProgressPercentage(50, 2)).toBe(25); // 50 / 200
      expect(LevelProgression.getXpProgressPercentage(150, 3)).toBe(50); // 150 / 300
    });

    it("should cap progress percentage at 100", () => {
      expect(LevelProgression.getXpProgressPercentage(120, 1)).toBe(100);
      expect(LevelProgression.getXpProgressPercentage(500, 2)).toBe(100);
    });
  });
});
