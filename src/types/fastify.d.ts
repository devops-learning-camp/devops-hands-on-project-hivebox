import { FastifyInstance } from 'fastify';
import { SenseBoxService } from '../senseBoxService';

// Minimal re-declare of Config to avoid importing config.ts from a declaration file
interface Config {
  appVer: string;
  host: string;
  port: number;
  senseBoxIds: string[];
}

declare module 'fastify' {
  interface FastifyInstance {
    config: Config;
    senseBoxService: SenseBoxService;
  }
}
