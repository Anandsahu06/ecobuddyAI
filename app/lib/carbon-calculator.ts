export interface CarbonFactors {
  carBaselinePerMile: number; // Scope 1: Passenger vehicle average
  busPerMile: number;         // Scope 2/3: Public bus transit
  trainPerMile: number;       // Scope 2: Electrified rail/subway
  flightPerMileShort: number; // Scope 1: Short-haul (<300 mi) with radiative forcing
  flightPerMileLong: number;  // Scope 1: Long-haul (>300 mi) with radiative forcing
  meatMealBaselineKg: number; // Scope 3: Meat/beef heavy meal
  veganMealBaselineKg: number;// Scope 3: Vegan/plant-based meal swap
  gridKwhCo2Kg: number;       // Scope 2: Regional electricity average
  recycleSolidWasteKg: number;// Scope 3: Landfill methane diversion
  scooterPerMile: number;     // Scope 1: Gasoline two-wheeler
  electricScooterPerMile: number; // Scope 2: Electric two-wheeler
  hybridCarPerMile: number;   // Scope 1: Hybrid vehicle
  electricCarPerMile: number; // Scope 2: Electric vehicle (EV)
}

export const EPA_FACTORS: CarbonFactors = {
  carBaselinePerMile: 0.368,
  busPerMile: 0.089,
  trainPerMile: 0.041,
  flightPerMileShort: 0.290,
  flightPerMileLong: 0.185,
  meatMealBaselineKg: 3.20,
  veganMealBaselineKg: 0.80,
  gridKwhCo2Kg: 0.370,
  recycleSolidWasteKg: 0.150,
  scooterPerMile: 0.100,
  electricScooterPerMile: 0.015,
  hybridCarPerMile: 0.200,
  electricCarPerMile: 0.100
};

export class CarbonCalculationEngine {
  /**
   * Calculate transport co2 saved compared to driving a standard car
   */
  static calculateTransportAvoided(miles: number, mode: "walking" | "cycling" | "bus" | "train" | "car" | "scooter" | "electric_scooter" | "hybrid" | "ev"): number {
    const baseline = EPA_FACTORS.carBaselinePerMile * miles;
    let alternative = 0;
    if (mode === "bus") alternative = EPA_FACTORS.busPerMile * miles;
    if (mode === "train") alternative = EPA_FACTORS.trainPerMile * miles;
    if (mode === "scooter") alternative = EPA_FACTORS.scooterPerMile * miles;
    if (mode === "electric_scooter") alternative = EPA_FACTORS.electricScooterPerMile * miles;
    if (mode === "hybrid") alternative = EPA_FACTORS.hybridCarPerMile * miles;
    if (mode === "ev") alternative = EPA_FACTORS.electricCarPerMile * miles;
    if (mode === "car") alternative = baseline; // No savings
    return parseFloat(Math.max(0, baseline - alternative).toFixed(2));
  }

  /**
   * Calculate aviation offset volume or savings (with radiative forcing multipliers)
   */
  static calculateAviationAvoided(miles: number, type: "short" | "long", offsetPercentage: number = 0): number {
    const factor = type === "short" ? EPA_FACTORS.flightPerMileShort : EPA_FACTORS.flightPerMileLong;
    const totalEmissions = miles * factor;
    const offset = totalEmissions * (offsetPercentage / 100);
    return parseFloat(offset.toFixed(2));
  }

  /**
   * Calculate emissions saved by swapping meat meal for plant-based meal
   */
  static calculateDietSwap(): number {
    return parseFloat((EPA_FACTORS.meatMealBaselineKg - EPA_FACTORS.veganMealBaselineKg).toFixed(2));
  }

  /**
   * Calculate emissions saved by reducing electricity usage
   */
  static calculateElectricitySaved(kwhSaved: number): number {
    return parseFloat((kwhSaved * EPA_FACTORS.gridKwhCo2Kg).toFixed(2));
  }

  /**
   * Calculate emissions saved by recycling solid waste bags
   */
  static calculateWasteRecycled(bags: number): number {
    return parseFloat((bags * EPA_FACTORS.recycleSolidWasteKg).toFixed(2));
  }
}
