import { describe, it, expect } from "vitest";
import { localFallbackParser } from "./route";

describe("localFallbackParser", () => {
  it("should parse Transport inputs correctly", () => {
    const result = localFallbackParser("I walked 5 miles to school");
    expect(result.category).toBe("Transport");
    expect(result.co2SavedKg).toBeGreaterThan(0);
    expect(result.carbonPoints).toBeGreaterThan(0);
    expect(result.explanation).toContain("Logged active/transit commute");
  });

  it("should parse Food inputs correctly", () => {
    const result = localFallbackParser("Ate a vegan burger today");
    expect(result.category).toBe("Food");
    expect(result.co2SavedKg).toBe(2.40);
    expect(result.carbonPoints).toBe(15);
    expect(result.explanation).toContain("Logged a plant-based meal swap");
  });

  it("should parse Energy inputs correctly", () => {
    const result = localFallbackParser("I turned off the AC and unplugged appliances");
    expect(result.category).toBe("Energy");
    expect(result.co2SavedKg).toBe(0.37);
    expect(result.carbonPoints).toBe(2);
    expect(result.explanation).toContain("Logged appliance shutdown");
  });

  it("should parse Waste inputs correctly", () => {
    const result = localFallbackParser("I recycled plastic packaging");
    expect(result.category).toBe("Waste");
    expect(result.co2SavedKg).toBe(0.15);
    expect(result.carbonPoints).toBe(1);
    expect(result.explanation).toContain("Logged solid waste recycle sort");
  });

  it("should return category None for unrecognized inputs", () => {
    const result = localFallbackParser("riding on tea or reading a book");
    expect(result.category).toBe("None");
    expect(result.co2SavedKg).toBe(0);
    expect(result.carbonPoints).toBe(0);
    expect(result.explanation).toContain("does not represent a recognized carbon-saving action");
  });
});
