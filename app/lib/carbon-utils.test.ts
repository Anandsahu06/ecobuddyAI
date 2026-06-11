import { describe, it, expect } from "vitest";
import {
  calculateTransportSavings,
  calculateDietSavings,
  calculatePoints,
  getStreakMultiplier,
  getEquivalenceMetrics,
  EMISSION_FACTORS,
  DIET_FACTORS
} from "./carbon-utils";

describe("carbon-utils", () => {
  describe("calculateTransportSavings", () => {
    it("should calculate correct savings compared to baseline car", () => {
      const distance = 10;
      const expectedWalking = parseFloat(((EMISSION_FACTORS.baselineCar - EMISSION_FACTORS.walking) * distance).toFixed(2));
      const expectedBus = parseFloat(((EMISSION_FACTORS.baselineCar - EMISSION_FACTORS.bus) * distance).toFixed(2));
      
      expect(calculateTransportSavings(distance, "walking")).toBe(expectedWalking);
      expect(calculateTransportSavings(distance, "bus")).toBe(expectedBus);
    });

    it("should return 0 when mode is baselineCar", () => {
      expect(calculateTransportSavings(20, "baselineCar")).toBe(0);
    });
  });

  describe("calculateDietSavings", () => {
    it("should calculate correct savings compared to baselineNonVeg meal", () => {
      const expectedVeg = parseFloat((DIET_FACTORS.baselineNonVeg - DIET_FACTORS.vegetarian).toFixed(2));
      expect(calculateDietSavings("vegetarian")).toBe(expectedVeg);
    });

    it("should return 0 when mode is baselineNonVeg", () => {
      expect(calculateDietSavings("baselineNonVeg")).toBe(0);
    });
  });

  describe("calculatePoints", () => {
    it("should return 10 points per kg rounded, min 1 point", () => {
      expect(calculatePoints(1.23)).toBe(12);
      expect(calculatePoints(0.04)).toBe(1); // min 1 point
      expect(calculatePoints(0)).toBe(1); // min 1 point
      expect(calculatePoints(10.5)).toBe(105);
    });
  });

  describe("getStreakMultiplier", () => {
    it("should return correct multipliers based on streak days", () => {
      expect(getStreakMultiplier(3)).toBe(1.0);
      expect(getStreakMultiplier(4)).toBe(1.2);
      expect(getStreakMultiplier(7)).toBe(1.2);
      expect(getStreakMultiplier(8)).toBe(1.5);
      expect(getStreakMultiplier(14)).toBe(1.5);
      expect(getStreakMultiplier(15)).toBe(2.0);
      expect(getStreakMultiplier(30)).toBe(2.0);
    });
  });

  describe("getEquivalenceMetrics", () => {
    it("should translate kg CO2 saved into smartphone charges, tree absorption months and trash bags", () => {
      const co2Saved = 10;
      const metrics = getEquivalenceMetrics(co2Saved);
      
      expect(metrics.smartphonesCharged).toBe(Math.round(co2Saved / 0.0082));
      expect(metrics.treeAbsorptionMonths).toBe(parseFloat((co2Saved / 1.83).toFixed(1)));
      expect(metrics.trashBagsDiverted).toBe(parseFloat((co2Saved / 9.2).toFixed(2)));
    });
  });
});
