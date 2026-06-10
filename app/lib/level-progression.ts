export interface LevelSpecs {
  level: number;
  xpRequiredForNext: number;
}

export class LevelProgression {
  private static BASE_XP = 100;

  /**
   * Calculates XP required to advance from the current level to the next.
   * level 1 = 100 XP, level 2 = 200 XP, level 3 = 300 XP, etc.
   */
  static getXpForLevel(level: number): number {
    const lvl = Math.max(1, level);
    return lvl * 100;
  }

  /**
   * Maps current XP inside a level to progression percentage
   */
  static getXpProgressPercentage(xpInCurrentLevel: number, level: number): number {
    const totalNeeded = this.getXpForLevel(level);
    return Math.min(100, Math.round((xpInCurrentLevel / totalNeeded) * 100));
  }
}
