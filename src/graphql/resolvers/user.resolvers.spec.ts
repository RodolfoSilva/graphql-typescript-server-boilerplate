import superTest from 'supertest';
import { User } from '../../models';
import serverInstance from '../../testServer';

const request = superTest(serverInstance);

describe('User resolvers', () => {
  let dbUsers: any;
  let passwordHashed: string;
  let user: any;
  // let token: string;
  const password = 'mypassword';

  beforeAll(async () => {
    passwordHashed = await User.generatePasswordHash(password);
  });

  beforeEach(async () => {
    dbUsers = {
      branStark: {
        email: 'branstark@gmail.com',
        name: 'Bran Stark',
        password: passwordHashed,
        roles: ['user'],
      },
      jonSnow: {
        email: 'jonsnow@gmail.com',
        name: 'Jon Snow',
        password: passwordHashed,
        roles: ['admin'],
      },
    };

    user = {
      email: 'contato@rodolfosilva.com',
      name: 'Rodolfo Silva',
      password,
      roles: ['admin'],
    };

    await User.deleteMany({});
    await User.insertMany(Object.values(dbUsers));
    // const dbUser = await User.findOne({ email: dbUsers.branStark.email });

    // token = await User.generateToken(dbUser.transform());
  });

  describe('Mutation.signup', () => {
    const query: string = `
      mutation($name: String, $email: String!, $password: String!, $roles: [String!]!) {
        signup(name: $name, email: $email, password: $password, roles: $roles) {
          token {
            access_token
            expires_in
            token_type
          }
          user {
            id
            email
            name
            roles
          }
        }
      }
    `;

    it('Should create a user account', async () => {
      const variables = user;

      const { body: response } = await request
        .post('/')
        .send({ query, variables });

      expect(response).toEqual({
        data: {
          signup: {
            token: {
              access_token: expect.any(String),
              expires_in: expect.any(Number),
              token_type: 'Bearer',
            },
            user: {
              id: expect.any(String),
              name: variables.name,
              email: variables.email,
              roles: variables.roles,
            },
          },
        },
      });
    });

    it('Should return error when email already exists', async () => {
      const variables = dbUsers.jonSnow;

      const { body: response } = await request
        .post('/')
        .send({ query, variables });

      expect(response).toEqual(
        expect.objectContaining({
          errors: [
            expect.objectContaining({
              message: `Has an user registered with this email: ${
                variables.email
              }`,
            }),
          ],
        }),
      );
    });
  });
  describe('Mutation.signin', () => {
    const query: string = `
      mutation($email: String!, $password: String!) {
        signin(email: $email, password: $password) {
          token {
            access_token
            expires_in
            token_type
          }
          user {
            id
            email
            name
            roles
          }
        }
      }
    `;

    it('Should authenticate', async () => {
      const variables = {
        email: dbUsers.jonSnow.email,
        password,
      };

      const { body: response } = await request
        .post('/')
        .send({ query, variables });

      expect(response).toEqual({
        data: {
          signin: {
            token: {
              access_token: expect.any(String),
              expires_in: expect.any(Number),
              token_type: 'Bearer',
            },
            user: {
              id: expect.any(String),
              name: dbUsers.jonSnow.name,
              email: dbUsers.jonSnow.email,
              roles: dbUsers.jonSnow.roles,
            },
          },
        },
      });
    });

    it('Should return error when email not exists', async () => {
      const variables = {
        email: 'invalid-user@email.com',
        password,
      };

      const { body: response } = await request
        .post('/')
        .send({ query, variables });

      expect(response).toEqual(
        expect.objectContaining({
          errors: [
            expect.objectContaining({
              message: 'Not authorized',
            }),
          ],
        }),
      );
    });

    it('Should return error when email exists and password is invalid', async () => {
      const variables = {
        email: dbUsers.jonSnow.email,
        password: 'invalid87112',
      };

      const { body: response } = await request
        .post('/')
        .send({ query, variables });

      expect(response).toEqual(
        expect.objectContaining({
          errors: [
            expect.objectContaining({
              message: 'Not authorized',
            }),
          ],
        }),
      );
    });
  });
});
