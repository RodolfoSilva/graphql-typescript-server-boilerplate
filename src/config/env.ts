import dotEnv from 'dotenv';
import dotEnvExpand from 'dotenv-expand';
import fs from 'fs';
import path from 'path';

export const getDotEnvFileNames = (
  dotEnvFileName: string,
  env: string,
): string[] => {
  // https://github.com/bkeepers/dotenv#what-other-env-files-can-i-use
  return [
    `${dotEnvFileName}.${env}.local`,
    `${dotEnvFileName}.${env}`,
    // Don't include `.env.local` for `test` environment
    // since normally you expect __tests__ to produce the same
    // results for everyone
    env !== 'test' ? `${dotEnvFileName}.local` : '',
    dotEnvFileName,
  ].filter(Boolean);
};

const basePath = path.resolve(path.join(__dirname, '../../'));
const dotEnvFiles: string[] = getDotEnvFileNames('.env', process.env
  .NODE_ENV as string);

// Load environment variables from .env* files. Suppress warnings using silent
// if this file is missing. dotEnv will never modify any environment variables
// that have already been set.  Variable expansion is supported in .env files.
// https://github.com/motdotla/dotenv
// https://github.com/motdotla/dotenv-expand
dotEnvFiles
  .map((fileName: string) => path.join(basePath, fileName as string))
  .filter((dotEnvFile: string) => fs.existsSync(dotEnvFile))
  .forEach((dotEnvFile: string) => {
    dotEnvExpand(dotEnv.config({ path: dotEnvFile }));
  });
