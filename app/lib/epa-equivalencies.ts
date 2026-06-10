export interface ImpactEquivalents {
  smartphoneCharges: number;
  gasMilesDriven: number;
  seedlingGrowthYears: number;
  trashBagsDiverted: number;
}

export class EPAVisualizer {
  /**
   * Converts raw kg CO2 saved into EPA equivalent impacts
   */
  static getEquivalents(co2SavedKg: number): ImpactEquivalents {
    return {
      // 1 kg CO2 avoids emissions from charging ~121.6 smartphones
      smartphoneCharges: Math.round(co2SavedKg * 121.6),
      
      // 1 kg CO2 avoids emissions of driving ~2.56 miles in a gas passenger car
      gasMilesDriven: parseFloat((co2SavedKg * 2.56).toFixed(1)),
      
      // 1 standard urban tree seedling grown for 10 years stores ~21.9 kg total (average of 2.19 kg/year)
      seedlingGrowthYears: parseFloat((co2SavedKg / 2.19).toFixed(2)),
      
      // 1 bag of recycled solid waste instead of landfilling avoids ~0.15 kg CO2
      trashBagsDiverted: parseFloat((co2SavedKg / 0.15).toFixed(1))
    };
  }
}
