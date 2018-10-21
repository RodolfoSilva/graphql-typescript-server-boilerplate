import './env';

const requiredEnvs = ['NODE_ENV', 'APP_SECRET', 'MONGO_URI'];

for (const requiredEnv of requiredEnvs) {
  if (!process.env[requiredEnv]) {
    throw new Error(
      `The ${requiredEnv} environment variable is required but was not specified.`,
    );
  }
}

export const env: string = process.env.NODE_ENV as string;
export const isDevelopment: boolean = env === 'development';
export const isTest: boolean = env === 'test';
export const isProduction: boolean = env === 'production';
export const appSecret: string = process.env.APP_SECRET as string;
export const mongo: string = process.env.MONGO_URI as string;
