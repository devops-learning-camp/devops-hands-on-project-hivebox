import Fastify from 'fastify';

import config from './config.ts';

const fastify = Fastify({
  logger: true,
});

fastify.get('/version', function (request, reply) {
  reply.send({ version: config.appVer });
});

fastify.get('/temperature', function (request, reply) {
  reply.send({ message: 'To be implemented' });
});

fastify.listen({ port: config.port }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  // Server is now listening on ${address}
});
