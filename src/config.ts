import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

if (!process.env.APP_VERSION || !process.env.HOST || !process.env.PORT) {
  throw new Error('Missing env variables');
}

interface Config {
  appVer: string;
  host: string;
  port: number;
}

const config: Config = {
  appVer: process.env.APP_VERSION!, // Non-null assertion since checked above
  host: process.env.HOST!,
  port: Number(process.env.PORT!),
};

export default config;
