import test from 'node:test';
import assert from 'node:assert';
import { SenseBoxAPI } from '../src/senseBoxAPI.ts';

// Mock fetch globally
const mockFetch = (response: any, ok = true) => {
  global.fetch = async () =>
    ({
      ok,
      json: async () => response,
    } as any);
};

test('SenseBoxAPI.getTemperaturesForSenseBoxes returns correct temperature for valid senseBoxId', async () => {
  const mockResponse = {
    sensors: [
      {
        title: 'Temperature',
        lastMeasurement: {
          value: '22.5',
          createdAt: new Date().toISOString(),
        },
      },
    ],
  };
  mockFetch(mockResponse);
  const api = new SenseBoxAPI();
  const result = await api.getTemperaturesForSenseBoxes(['validId']);
  assert.strictEqual(result['validId'], 22.5);
});

test('SenseBoxAPI.getTemperaturesForSenseBoxes returns null for missing temperature sensor', async () => {
  const mockResponse = {
    sensors: [
      {
        title: 'Humidity',
        lastMeasurement: {
          value: '50',
          createdAt: new Date().toISOString(),
        },
      },
    ],
  };
  mockFetch(mockResponse);
  const api = new SenseBoxAPI();
  const result = await api.getTemperaturesForSenseBoxes(['noTempId']);
  assert.strictEqual(result['noTempId'], null);
});

test('SenseBoxAPI.getTemperaturesForSenseBoxes returns null for old measurement', async () => {
  const mockResponse = {
    sensors: [
      {
        title: 'Temperature',
        lastMeasurement: {
          value: '18.0',
          createdAt: new Date(Date.now() - 2 * 3600_000).toISOString(), // 2 hours ago
        },
      },
    ],
  };
  mockFetch(mockResponse);
  const api = new SenseBoxAPI();
  const result = await api.getTemperaturesForSenseBoxes(['oldId'], 3600_000); // 1 hour max age
  assert.strictEqual(result['oldId'], null);
});

test('SenseBoxAPI.getTemperaturesForSenseBoxes returns null for failed fetch', async () => {
  global.fetch = async () => ({ ok: false } as any);
  const api = new SenseBoxAPI();
  const result = await api.getTemperaturesForSenseBoxes(['failId']);
  assert.strictEqual(result['failId'], null);
});
