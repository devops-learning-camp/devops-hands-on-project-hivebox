/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 * @param {Object} options plugin options, refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */
import { SenseBoxService } from './senseBoxService.ts';
async function routes(fastify) {
  fastify.get('/version', function (_req, reply) {
    reply.send({ version: fastify.config.appVer });
  });

  fastify.get('/temperature', async function (_req, reply) {
    try {
      // read service from fastify decoration, allows tests to swap a mock
      const service = fastify.senseBoxService as SenseBoxService;
      const result = await service.getAverageTemperatureForSenseBoxes(
        fastify.config.senseBoxIds
      );
      reply.send(result);
    } catch {
      reply.status(500).send({ error: 'Failed to fetch temperature data' });
    }
  });
}

export default routes;
