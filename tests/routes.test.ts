import test from 'node:test';
import assert from 'node:assert';
import Fastify from 'fastify';
import routes from '../src/routes.ts';

test('GET /version returns app version from config', async () => {
  const fastify = Fastify();
  // provide a minimal config
  fastify.decorate('config', { appVer: '1.2.3', senseBoxIds: [] });
  // provide a dummy service just to satisfy routes
  fastify.decorate('senseBoxService', {
    getAverageTemperatureForSenseBoxes: async () => ({
      averageTemperature: null,
      temperatures: {},
    }),
  });
  fastify.register(routes);
  await fastify.ready();

  const res = await fastify.inject({ method: 'GET', url: '/version' });
  assert.strictEqual(res.statusCode, 200);
  const body = JSON.parse(res.payload);
  assert.strictEqual(body.version, '1.2.3');
  await fastify.close();
});

test('GET /temperature returns average from service (happy path)', async () => {
  const fastify = Fastify();
  fastify.decorate('config', { appVer: '1.2.3', senseBoxIds: ['a'] });
  const mockService = {
    getAverageTemperatureForSenseBoxes: async (ids) => ({
      averageTemperature: 21,
      temperatures: { a: 21 },
    }),
  };
  fastify.decorate('senseBoxService', mockService);
  fastify.register(routes);
  await fastify.ready();

  const res = await fastify.inject({ method: 'GET', url: '/temperature' });
  assert.strictEqual(res.statusCode, 200);
  const body = JSON.parse(res.payload);
  assert.strictEqual(body.averageTemperature, 21);
  assert.deepStrictEqual(body.temperatures, { a: 21 });
  await fastify.close();
});

test('GET /temperature returns 500 when service throws', async () => {
  const fastify = Fastify();
  fastify.decorate('config', { appVer: '1.2.3', senseBoxIds: ['a'] });
  const mockService = {
    getAverageTemperatureForSenseBoxes: async () => {
      throw new Error('upstream failure');
    },
  };
  fastify.decorate('senseBoxService', mockService);
  fastify.register(routes);
  await fastify.ready();

  const res = await fastify.inject({ method: 'GET', url: '/temperature' });
  // route converts failures to 500
  assert.strictEqual(res.statusCode, 500);
  const body = JSON.parse(res.payload);
  assert.strictEqual(body.error, 'Failed to fetch temperature data');
  await fastify.close();
});
