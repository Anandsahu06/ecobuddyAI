import { describe, it, expect } from "vitest";
import { getLocalDateString, getRandomQuests } from "./app-context";

describe("app-context helpers", () => {
  describe("getLocalDateString", () => {
    it("should format date to YYYY-MM-DD", () => {
      const date = new Date(2026, 5, 12); // Month is 0-indexed, so 5 is June
      expect(getLocalDateString(date)).toBe("2026-06-12");
    });

    it("should pad single digit days and months with zero", () => {
      const date = new Date(2026, 0, 5); // January 5
      expect(getLocalDateString(date)).toBe("2026-01-05");
    });
  });

  describe("getRandomQuests", () => {
    it("should return correct number of quests", () => {
      const quests = getRandomQuests(3);
      expect(quests).toHaveLength(3);
    });

    it("should initialize progress to 0 and completed to false", () => {
      const quests = getRandomQuests(2);
      quests.forEach((q) => {
        expect(q.progress).toBe(0);
        expect(q.completed).toBe(false);
        expect(q.id).toBeDefined();
        expect(q.title).toBeDefined();
        expect(q.description).toBeDefined();
        expect(q.targetCo2).toBeGreaterThan(0);
      });
    });

    it("should return unique quests in the list", () => {
      const quests = getRandomQuests(4);
      const ids = quests.map((q) => q.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });
});
