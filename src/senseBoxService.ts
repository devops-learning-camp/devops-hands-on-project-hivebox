import { SenseBoxAPI } from './senseBoxAPI.ts';
export class SenseBoxService {
  private api: SenseBoxAPI;

  constructor(api: SenseBoxAPI) {
    this.api = api;
  }

  async getAverageTemperatureForSenseBoxes(
    senseBoxIds: string[],
    maxAgeMs: number = 3600_000 // 1 hour by default
  ): Promise<{
    averageTemperature: number | null;
    temperatures: { [id: string]: number | null };
  }> {
    const temperatures = await this.api.getTemperaturesForSenseBoxes(
      senseBoxIds,
      maxAgeMs
    );
    const validTemperatures =
      SenseBoxService.extractValidTemperatures(temperatures);
    const averageTemperature =
      SenseBoxService.calculateAverage(validTemperatures);
    return { averageTemperature, temperatures };
  }

  static extractValidTemperatures(temperatures: {
    [id: string]: number | null;
  }): number[] {
    return Object.values(temperatures).filter(
      (t): t is number => typeof t === 'number'
    );
  }

  static calculateAverage(values: number[]): number | null {
    if (values.length === 0) return null;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
  }
}
