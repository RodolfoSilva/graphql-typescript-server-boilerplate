import './env';
import checkEnvs, { IEnvironments } from '../utils/checkEnvs';

checkEnvs(
  ['NODE_ENV', 'APP_SECRET', 'MONGO_URI'],
  process.env as IEnvironments,
);

export const env: string = process.env.NODE_ENV as string;
export const isDevelopment: boolean = env === 'development';
export const isTest: boolean = env === 'test';
export const isProduction: boolean = env === 'production';
export const appSecret: string = process.env.APP_SECRET as string;
export const mongo: string = process.env.MONGO_URI as string;
