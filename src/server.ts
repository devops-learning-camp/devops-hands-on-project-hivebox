import Fastify from 'fastify';

import config from './config.ts';
import routes from './routes.ts';

const fastify = Fastify({
  logger: true,
});

fastify.decorate('config', config);

fastify.register(routes);

fastify.listen({ port: config.port }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  // Server is now listening on ${address}
});
