/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 * @param {Object} options plugin options, refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */
import { getAverageTemperatureForSenseBoxes } from './senseBoxService.ts';

async function routes(fastify, options) {
  fastify.get('/version', function (request, reply) {
    reply.send({ version: fastify.config.appVer });
  });

  fastify.get('/temperature', async function (request, reply) {
    try {
      const result = await getAverageTemperatureForSenseBoxes(
        fastify.config.senseBoxIds
      );
      reply.send(result);
    } catch (err) {
      reply.status(500).send({ error: 'Failed to fetch temperature data' });
    }
  });
}

export default routes;
