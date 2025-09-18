type Measurement = { value?: string; createdAt?: string };
type Sensor = { title?: string; lastMeasurement?: Measurement };
type BoxData = { sensors?: Sensor[] };

export class SenseBoxAPI {
  private nowProvider: () => number;

  constructor(nowProvider: () => number = () => Date.now()) {
    this.nowProvider = nowProvider;
  }

  async fetchSenseBoxData(id: string): Promise<BoxData | null> {
    try {
      const res = await fetch(
        `https://api.opensensemap.org/boxes/${id}?format=json`
      );
      if (!res.ok) return null;
      return (await res.json()) as BoxData;
    } catch (err) {
      // minimal logging for visibility, don't throw
       
      console.warn(
        `fetchSenseBoxData failed for ${id}: ${(err as Error).message}`
      );
      return null;
    }
  }

  findTemperatureSensor(boxData: BoxData): Sensor | null {
    return (
      boxData?.sensors?.find((sensor: Sensor) =>
        sensor.title?.toLowerCase().includes('temp')
      ) || null
    );
  }

  isMeasurementRecent(measurement: Measurement, maxAgeMs: number): boolean {
    if (!measurement?.createdAt) return false;
    const measurementTime = new Date(measurement.createdAt).getTime();
    return this.nowProvider() - measurementTime <= maxAgeMs;
  }

  async getTemperaturesForSenseBoxes(
    senseBoxIds: string[],
    maxAgeMs: number = 3600_000 // 1 hour by default
  ): Promise<{ [id: string]: number | null }> {
    const results: { [id: string]: number | null } = {};

    await Promise.all(
      senseBoxIds.map(async (id) => {
        const boxData = await this.fetchSenseBoxData(id);
        if (!boxData) {
          results[id] = null;
          return;
        }
        const tempSensor = this.findTemperatureSensor(boxData);
        const lm = tempSensor?.lastMeasurement;
        if (
          lm &&
          typeof lm.value === 'string' &&
          this.isMeasurementRecent(lm, maxAgeMs)
        ) {
          // handle comma decimals and ensure numeric result
          const cleaned = lm.value.replace(',', '.');
          const parsed = parseFloat(cleaned);
          results[id] = Number.isFinite(parsed) ? parsed : null;
        } else {
          results[id] = null;
        }
      })
    );

    return results;
  }
}
