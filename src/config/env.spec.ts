import { getDotEnvFileNames } from './env';

describe('checkEnvs', () => {
  it('should return all environment when not is test', () => {
    const dotEnvFileNames = getDotEnvFileNames('.env', 'production');
    expect(dotEnvFileNames).toEqual([
      '.env.production.local',
      '.env.production',
      '.env.local',
      '.env',
    ]);
  });

  it('should return all environment except .env.local when not is test', () => {
    const dotEnvFileNames = getDotEnvFileNames('.env', 'test');
    expect(dotEnvFileNames).toEqual(['.env.test.local', '.env.test', '.env']);
  });
});
