async function fetchSenseBoxData(id: string): Promise<any | null> {
  try {
    const res = await fetch(
      `https://api.opensensemap.org/boxes/${id}?format=json`
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function findTemperatureSensor(boxData: any): any | null {
  return (
    boxData?.sensors?.find((sensor: any) =>
      sensor.title?.toLowerCase().includes('temp')
    ) || null
  );
}

function isMeasurementRecent(
  measurement: any,
  maxAgeMs: number,
  now: number
): boolean {
  if (!measurement?.createdAt) return false;
  const measurementTime = new Date(measurement.createdAt).getTime();
  return now - measurementTime <= maxAgeMs;
}

export async function getTemperaturesForSenseBoxes(
  senseBoxIds: string[],
  maxAgeMs: number = 3600_000 // 1 hour by default
): Promise<{ [id: string]: number | null }> {
  const results: { [id: string]: number | null } = {};
  const now = Date.now();

  await Promise.all(
    senseBoxIds.map(async (id) => {
      const boxData = await fetchSenseBoxData(id);
      if (!boxData) {
        results[id] = null;
        return;
      }
      const tempSensor = findTemperatureSensor(boxData);
      if (
        tempSensor &&
        tempSensor.lastMeasurement &&
        typeof tempSensor.lastMeasurement.value === 'string' &&
        isMeasurementRecent(tempSensor.lastMeasurement, maxAgeMs, now)
      ) {
        results[id] = parseFloat(tempSensor.lastMeasurement.value);
      } else {
        results[id] = null;
      }
    })
  );

  return results;
}
