import dotEnv from 'dotenv';
import dotEnvExpand from 'dotenv-expand';
import fs from 'fs';
import path from 'path';

const { NODE_ENV } = process.env as { NODE_ENV: string };

if (!NODE_ENV) {
  throw new Error(
    'The NODE_ENV environment variable is required but was not specified.'
  );
}

interface ILoadOptions {
  basePath: string;
  env: string;
  dotEnvFileName?: string;
}

const loadEnvironment = ({
  basePath,
  env,
  dotEnvFileName = '.env'
}: ILoadOptions): void => {
  // https://github.com/bkeepers/dotenv#what-other-env-files-can-i-use
  const dotEnvFiles: string[] = [
    `${dotEnvFileName}.${env}.local`,
    `${dotEnvFileName}.${env}`,
    // Don't include `.env.local` for `test` environment
    // since normally you expect __tests__ to produce the same
    // results for everyone
    env !== 'test' ? `${dotEnvFileName}.local` : '',
    dotEnvFileName
  ];

  // Load environment variables from .env* files. Suppress warnings using silent
  // if this file is missing. dotEnv will never modify any environment variables
  // that have already been set.  Variable expansion is supported in .env files.
  // https://github.com/motdotla/dotenv
  // https://github.com/motdotla/dotenv-expand
  dotEnvFiles
    .filter(Boolean)
    .map((fileName: string) => path.join(basePath, fileName as string))
    .filter((dotEnvFile: string) => fs.existsSync(dotEnvFile))
    .forEach((dotEnvFile: string) => {
      dotEnvExpand(dotEnv.config({ path: dotEnvFile }));
    });
};

loadEnvironment({
  basePath: path.resolve(path.join(__dirname, '../../')),
  env: NODE_ENV
});
