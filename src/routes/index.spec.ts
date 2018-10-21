import superTest from 'supertest';
import serverInstance from '../testServer';
const request = superTest(serverInstance);

describe('Status', () => {
  it('GET /status - Should response ok', async () => {
    await request.get('/status').expect('ok');
  });
});
