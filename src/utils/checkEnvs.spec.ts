import checkEnvs, { IEnvironments } from './checkEnvs';

describe('checkEnvs', () => {
  const envs: IEnvironments = {
    NODE_ENV: 'test',
    PORT: 4000,
  };

  it('should return true when all environments exists', () => {
    expect(() => checkEnvs(['NODE_ENV', 'PORT'], envs)).not.toThrow();
  });

  it('should fire a throw exception when environment not exists', () => {
    expect(() => checkEnvs(['NODE_ENV', 'PORT', 'APP_SECRET'], envs)).toThrow(
      new Error(
        'The APP_SECRET environment variable is required but was not specified.',
      ),
    );
  });
});
