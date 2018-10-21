import gql from 'graphql-tag';
import superTest from 'supertest';
import serverInstance from '../../testServer';

const request = superTest(serverInstance);

describe('Welcome resolvers', () => {
  it('Should return Hello World', async () => {
    const query: string = gql`
      {
        welcome
      }
    `;

    await request
      .post('/')
      .send({
        query
      })
      .expect({
        data: { welcome: 'Hello World' }
      });
  });

  it('Should return Hello Rodolfo', async () => {
    const query: string = gql`
      query($name: String) {
        welcome(name: $name)
      }
    `;

    const variables = {
      name: 'Rodolfo'
    };

    await request
      .post('/')
      .send({
        query,
        variables
      })
      .expect({
        data: { welcome: 'Hello Rodolfo' }
      });
  });
});
