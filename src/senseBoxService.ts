import { getTemperaturesForSenseBoxes } from './senseBoxAPI.ts';

function extractValidTemperatures(temperatures: {
  [id: string]: number | null;
}): number[] {
  return Object.values(temperatures).filter(
    (t): t is number => typeof t === 'number'
  );
}

function calculateAverage(values: number[]): number | null {
  if (values.length === 0) return null;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

export async function getAverageTemperatureForSenseBoxes(
  senseBoxIds: string[],
  maxAgeMs: number = 3600_000 // 1 hour by default
): Promise<{
  averageTemperature: number | null;
  temperatures: { [id: string]: number | null };
}> {
  const temperatures = await getTemperaturesForSenseBoxes(
    senseBoxIds,
    maxAgeMs
  );
  const validTemperatures = extractValidTemperatures(temperatures);
  const averageTemperature = calculateAverage(validTemperatures);
  return { averageTemperature, temperatures };
}
