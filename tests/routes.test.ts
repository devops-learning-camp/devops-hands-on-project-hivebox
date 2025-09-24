import test from 'node:test';
import assert from 'node:assert';
import Fastify from 'fastify';
import routes from '../src/routes.ts';

test('GET /version returns configured app version', async () => {
  const fastify = Fastify();
  // minimal config required by routes
  fastify.decorate('config', { appVer: '9.9.9', senseBoxIds: [] });
  // dummy service to satisfy temperature route registration
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
  assert.strictEqual(body.version, '9.9.9');
  await fastify.close();
});

test('GET /temperature calls service with config ids and returns result', async () => {
  const fastify = Fastify();
  const called = { ids: null } as { ids: string[] | null };
  const mockService = {
    getAverageTemperatureForSenseBoxes: async (ids: string[]) => {
      called.ids = ids;
      return { averageTemperature: 22.5, temperatures: { a: 22.5, b: 22 } };
    },
  };

  fastify.decorate('config', { appVer: 'x', senseBoxIds: ['a', 'b'] });
  fastify.decorate('senseBoxService', mockService);
  fastify.register(routes);
  await fastify.ready();

  const res = await fastify.inject({ method: 'GET', url: '/temperature' });
  assert.strictEqual(res.statusCode, 200);
  const body = JSON.parse(res.payload);
  assert.strictEqual(body.averageTemperature, 22.5);
  assert.deepStrictEqual(body.temperatures, { a: 22.5, b: 22 });
  assert.deepStrictEqual(called.ids, ['a', 'b']);
  await fastify.close();
});
