export interface IEnvironments {
  [key: string]: string | number | null | boolean | undefined;
}

const checkEnvs = (requiredEnvs: string[], envs: IEnvironments) => {
  for (const requiredEnv of requiredEnvs) {
    if (!envs[requiredEnv]) {
      throw new Error(
        `The ${requiredEnv} environment variable is required but was not specified.`,
      );
    }
  }
};

export default checkEnvs;
