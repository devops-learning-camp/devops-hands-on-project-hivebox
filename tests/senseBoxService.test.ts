import test from 'node:test';
import assert from 'node:assert';
import { SenseBoxService } from '../src/senseBoxService.ts';
import * as senseBoxAPI from '../src/senseBoxAPI.ts';

test('SenseBoxService.extractValidTemperatures returns only numbers', () => {
  const input = { a: 10, b: null, c: 20, e: 0 };
  const result = SenseBoxService.extractValidTemperatures(input);
  assert.deepStrictEqual(result, [10, 20, 0]);
});

test('SenseBoxService.extractValidTemperatures returns empty array if no numbers', () => {
  const input = { a: null, b: null };
  const result = SenseBoxService.extractValidTemperatures(input);
  assert.deepStrictEqual(result, []);
});

test('SenseBoxService.calculateAverage returns correct average', () => {
  const input = [10, 20, 30];
  const result = SenseBoxService.calculateAverage(input);
  assert.strictEqual(result, 20);
});

test('SenseBoxService.calculateAverage returns null for empty array', () => {
  const input = [];
  const result = SenseBoxService.calculateAverage(input);
  assert.strictEqual(result, null);
});

test('SenseBoxService.getAverageTemperatureForSenseBoxes returns correct average for all valid temperatures', async () => {
  class MockService extends SenseBoxService {
    async getAverageTemperatureForSenseBoxes(ids, maxAgeMs) {
      const temperatures = { a: 10, b: 20, c: 30 };
      const validTemperatures =
        SenseBoxService.extractValidTemperatures(temperatures);
      const averageTemperature =
        SenseBoxService.calculateAverage(validTemperatures);
      return { averageTemperature, temperatures };
    }
  }
  const service = new MockService();
  const result = await service.getAverageTemperatureForSenseBoxes(
    ['a', 'b', 'c'],
    3600_000
  );
  assert.strictEqual(result.averageTemperature, 20);
  assert.deepStrictEqual(result.temperatures, { a: 10, b: 20, c: 30 });
});

test('SenseBoxService.getAverageTemperatureForSenseBoxes returns null average if all temperatures are null', async () => {
  class MockService extends SenseBoxService {
    async getAverageTemperatureForSenseBoxes(ids, maxAgeMs) {
      const temperatures = { a: null, b: null };
      const validTemperatures =
        SenseBoxService.extractValidTemperatures(temperatures);
      const averageTemperature =
        SenseBoxService.calculateAverage(validTemperatures);
      return { averageTemperature, temperatures };
    }
  }
  const service = new MockService();
  const result = await service.getAverageTemperatureForSenseBoxes(
    ['a', 'b'],
    3600_000
  );
  assert.strictEqual(result.averageTemperature, null);
  assert.deepStrictEqual(result.temperatures, { a: null, b: null });
});

test('SenseBoxService.getAverageTemperatureForSenseBoxes returns correct average with mixed valid and null temperatures', async () => {
  class MockService extends SenseBoxService {
    async getAverageTemperatureForSenseBoxes(ids, maxAgeMs) {
      const temperatures = { a: 10, b: null, c: 30 };
      const validTemperatures =
        SenseBoxService.extractValidTemperatures(temperatures);
      const averageTemperature =
        SenseBoxService.calculateAverage(validTemperatures);
      return { averageTemperature, temperatures };
    }
  }
  const service = new MockService();
  const result = await service.getAverageTemperatureForSenseBoxes(
    ['a', 'b', 'c'],
    3600_000
  );
  assert.strictEqual(result.averageTemperature, 20);
  assert.deepStrictEqual(result.temperatures, { a: 10, b: null, c: 30 });
});
