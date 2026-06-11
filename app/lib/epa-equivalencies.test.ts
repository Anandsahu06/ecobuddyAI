import { describe, it, expect } from "vitest";
import { EPAVisualizer } from "./epa-equivalencies";

describe("EPAVisualizer", () => {
  describe("getEquivalents", () => {
    it("should convert kg CO2 saved into equivalents correctly", () => {
      const co2SavedKg = 5;
      const res = EPAVisualizer.getEquivalents(co2SavedKg);
      
      expect(res.smartphoneCharges).toBe(Math.round(co2SavedKg * 121.6));
      expect(res.gasMilesDriven).toBe(parseFloat((co2SavedKg * 2.56).toFixed(1)));
      expect(res.seedlingGrowthYears).toBe(parseFloat((co2SavedKg / 2.19).toFixed(2)));
      expect(res.trashBagsDiverted).toBe(parseFloat((co2SavedKg / 0.15).toFixed(1)));
    });

    it("should handle 0 kg saved correctly", () => {
      const res = EPAVisualizer.getEquivalents(0);
      expect(res.smartphoneCharges).toBe(0);
      expect(res.gasMilesDriven).toBe(0);
      expect(res.seedlingGrowthYears).toBe(0);
      expect(res.trashBagsDiverted).toBe(0);
    });
  });
});
