import Fastify from 'fastify';

import config from './config.ts';
import routes from './routes.ts';
import { SenseBoxAPI } from './senseBoxAPI.ts';
import { SenseBoxService } from './senseBoxService.ts';

const fastify = Fastify({
  logger: true,
});

fastify.decorate('config', config);

// instantiate service here and make it available to routes via decoration
const api = new SenseBoxAPI();
const senseBoxService = new SenseBoxService(api);
fastify.decorate('senseBoxService', senseBoxService);

fastify.register(routes);

fastify.listen(
  { port: config.port, host: config.host },
  function (err, address) {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
    fastify.log.info(`Server listening on ${address}`);
  }
);
