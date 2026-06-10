/**
 * Carbon Footprint Calculation Utilities
 * Based on US EPA, UK DEFRA, and IPCC standards.
 */

export const EMISSION_FACTORS = {
  walking: 0.000,
  cycling: 0.000,
  train: 0.041,  // kg CO2e per passenger-mile
  bus: 0.089,    // kg CO2e per passenger-mile
  motorcycle: 0.113, // kg CO2e per passenger-mile
  flightShort: 0.245, // <500 miles, higher takeoff burn
  flightLong: 0.182,  // >500 miles
  baselineCar: 0.368, // Standard passenger car baseline (US average)
};

export const DIET_FACTORS = {
  vegetarian: 1.15,   // kg CO2e per meal
  mixed: 2.20,        // kg CO2e per meal (Flexitarian)
  baselineNonVeg: 4.18, // kg CO2e per meal (standard US beef-heavy baseline)
};

export const ENERGY_FACTORS = {
  low: 3.10,         // kg CO2e per day (highly efficient or solar-backed)
  medium: 8.20,      // kg CO2e per day (average apartment baseline)
  high: 18.50,       // kg CO2e per day (large central-air HVAC household)
};

/**
 * Calculates carbon avoided in kg compared to driving a standard passenger car.
 * Formula: (BaselineCar - ModeUsed) * Distance
 */
export function calculateTransportSavings(distanceMiles: number, mode: keyof typeof EMISSION_FACTORS): number {
  const modeFactor = EMISSION_FACTORS[mode] ?? EMISSION_FACTORS.baselineCar;
  const savings = (EMISSION_FACTORS.baselineCar - modeFactor) * distanceMiles;
  return parseFloat(Math.max(0, savings).toFixed(2));
}

/**
 * Calculates carbon avoided in kg compared to eating a standard meat-heavy meal.
 * Formula: BaselineNonVeg - MealTypeUsed
 */
export function calculateDietSavings(mealType: keyof typeof DIET_FACTORS): number {
  const mealFactor = DIET_FACTORS[mealType] ?? DIET_FACTORS.baselineNonVeg;
  const savings = DIET_FACTORS.baselineNonVeg - mealFactor;
  return parseFloat(Math.max(0, savings).toFixed(2));
}

/**
 * Converts avoided carbon (kg) into gamification points.
 * Rule: 10 points per kg CO2e avoided, min 1 point.
 */
export function calculatePoints(co2SavedKg: number): number {
  return Math.max(1, Math.round(co2SavedKg * 10));
}

/**
 * Determines point multiplier based on consecutive logging streak.
 */
export function getStreakMultiplier(streakDays: number): number {
  if (streakDays >= 15) return 2.0;
  if (streakDays >= 8) return 1.5;
  if (streakDays >= 4) return 1.2;
  return 1.0;
}

/**
 * Translates carbon saved into physical everyday comparisons for UI display.
 */
export function getEquivalenceMetrics(co2SavedKg: number) {
  // US EPA: 1 smartphone charge = 0.0082 kg CO2e
  const smartphones = Math.round(co2SavedKg / 0.0082);
  
  // US EPA: 1 mature tree absorbs ~22 kg CO2e per year (1.83 kg per month)
  const treeMonths = parseFloat((co2SavedKg / 1.83).toFixed(1));

  // US EPA: 1 standard garbage bag in landfill = 9.2 kg CO2e
  const trashBags = parseFloat((co2SavedKg / 9.2).toFixed(2));

  return {
    smartphonesCharged: smartphones,
    treeAbsorptionMonths: treeMonths,
    trashBagsDiverted: trashBags,
  };
}
