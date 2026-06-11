import { describe, it, expect } from "vitest";
import { CarbonCalculationEngine, EPA_FACTORS } from "./carbon-calculator";

describe("CarbonCalculationEngine", () => {
  describe("calculateTransportAvoided", () => {
    it("should calculate correct savings for walking/cycling (alternative emissions = 0)", () => {
      const miles = 10;
      const expected = parseFloat((EPA_FACTORS.carBaselinePerMile * miles).toFixed(2));
      expect(CarbonCalculationEngine.calculateTransportAvoided(miles, "walking")).toBe(expected);
      expect(CarbonCalculationEngine.calculateTransportAvoided(miles, "cycling")).toBe(expected);
    });

    it("should return 0 savings when commuting by standard car", () => {
      expect(CarbonCalculationEngine.calculateTransportAvoided(15, "car")).toBe(0);
    });

    it("should calculate correct savings for transit/bus", () => {
      const miles = 5;
      const baseline = EPA_FACTORS.carBaselinePerMile * miles;
      const alt = EPA_FACTORS.busPerMile * miles;
      const expected = parseFloat((baseline - alt).toFixed(2));
      expect(CarbonCalculationEngine.calculateTransportAvoided(miles, "bus")).toBe(expected);
    });

    it("should calculate correct savings for train", () => {
      const miles = 20;
      const baseline = EPA_FACTORS.carBaselinePerMile * miles;
      const alt = EPA_FACTORS.trainPerMile * miles;
      const expected = parseFloat((baseline - alt).toFixed(2));
      expect(CarbonCalculationEngine.calculateTransportAvoided(miles, "train")).toBe(expected);
    });

    it("should calculate correct savings for ev and hybrid", () => {
      const miles = 50;
      const baseline = EPA_FACTORS.carBaselinePerMile * miles;
      const evAlt = EPA_FACTORS.electricCarPerMile * miles;
      const hybridAlt = EPA_FACTORS.hybridCarPerMile * miles;
      
      expect(CarbonCalculationEngine.calculateTransportAvoided(miles, "ev")).toBe(
        parseFloat((baseline - evAlt).toFixed(2))
      );
      expect(CarbonCalculationEngine.calculateTransportAvoided(miles, "hybrid")).toBe(
        parseFloat((baseline - hybridAlt).toFixed(2))
      );
    });
  });

  describe("calculateAviationAvoided", () => {
    it("should return 0 when offset percentage is 0", () => {
      expect(CarbonCalculationEngine.calculateAviationAvoided(1000, "long", 0)).toBe(0);
    });

    it("should calculate correct offset for short flights", () => {
      const miles = 200;
      const totalEmissions = miles * EPA_FACTORS.flightPerMileShort;
      const expected = parseFloat((totalEmissions * 0.5).toFixed(2)); // 50% offset
      expect(CarbonCalculationEngine.calculateAviationAvoided(miles, "short", 50)).toBe(expected);
    });

    it("should calculate correct offset for long flights", () => {
      const miles = 1500;
      const totalEmissions = miles * EPA_FACTORS.flightPerMileLong;
      const expected = parseFloat((totalEmissions * 0.25).toFixed(2)); // 25% offset
      expect(CarbonCalculationEngine.calculateAviationAvoided(miles, "long", 25)).toBe(expected);
    });
  });

  describe("calculateDietSwap", () => {
    it("should return the difference between meat and vegan baseline emissions", () => {
      const expected = parseFloat(
        (EPA_FACTORS.meatMealBaselineKg - EPA_FACTORS.veganMealBaselineKg).toFixed(2)
      );
      expect(CarbonCalculationEngine.calculateDietSwap()).toBe(expected);
    });
  });

  describe("calculateElectricitySaved", () => {
    it("should calculate correct emissions saved based on grid factor", () => {
      const kwh = 100;
      const expected = parseFloat((kwh * EPA_FACTORS.gridKwhCo2Kg).toFixed(2));
      expect(CarbonCalculationEngine.calculateElectricitySaved(kwh)).toBe(expected);
    });
  });

  describe("calculateWasteRecycled", () => {
    it("should calculate correct emissions saved based on bags of solid waste", () => {
      const bags = 5;
      const expected = parseFloat((bags * EPA_FACTORS.recycleSolidWasteKg).toFixed(2));
      expect(CarbonCalculationEngine.calculateWasteRecycled(bags)).toBe(expected);
    });
  });
});
