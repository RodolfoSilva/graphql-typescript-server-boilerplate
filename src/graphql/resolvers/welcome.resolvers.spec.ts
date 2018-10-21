import superTest from 'supertest';
import serverInstance from '../../testServer';

const request = superTest(serverInstance);

describe('Welcome resolvers', () => {
  describe('Query.welcome', () => {
    const query: string = `
      query($name: String) {
        welcome(name: $name)
      }
    `;

    it('Should return Hello World', async () => {
      await request
        .post('/')
        .send({
          query,
        })
        .expect({
          data: { welcome: 'Hello World' },
        });
    });

    it('Should return Hello Rodolfo', async () => {
      const variables = {
        name: 'Rodolfo',
      };

      await request
        .post('/')
        .send({
          query,
          variables,
        })
        .expect({
          data: { welcome: 'Hello Rodolfo' },
        });
    });
  });
});
