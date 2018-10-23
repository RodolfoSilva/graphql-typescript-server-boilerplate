import superTest from 'supertest';
import { User } from '../../models';
import { IUserDocument } from '../../models/user.model';
import { createToken } from '../../services/createAuthPayload';
import serverInstance from '../../testServer';
import { createFakeEmail, createFakePersonName } from '../../utils/testHelpers';

const request = superTest(serverInstance);

describe('User resolvers', () => {
  let dbUsers: any;
  let passwordHashed: string;
  let user: any;
  let token: string;
  const password = 'mypassword';

  beforeAll(async () => {
    passwordHashed = await User.generatePasswordHash(password);
  });

  beforeEach(async () => {
    if (dbUsers) {
      await User.deleteMany({
        email: {
          $in: [user.email, dbUsers.branStark.email, dbUsers.jonSnow.email],
        },
      });
    }
    dbUsers = {
      branStark: {
        email: createFakeEmail(),
        name: createFakePersonName(),
        password: passwordHashed,
        roles: ['user'],
      },
      jonSnow: {
        email: createFakeEmail(),
        name: createFakePersonName(),
        password: passwordHashed,
        roles: ['admin'],
      },
    };

    user = {
      email: createFakeEmail(),
      name: createFakePersonName(),
      password,
      roles: ['admin'],
    };

    await User.insertMany(Object.values(dbUsers));
    const dbUser = await User.findOne({ email: dbUsers.jonSnow.email });

    token = await createToken(dbUser as IUserDocument);
  });

  describe('Mutation.signUp', () => {
    const query: string = `
      mutation($name: String, $email: String!, $password: String!, $roles: [String!]!) {
        signUp(name: $name, email: $email, password: $password, roles: $roles) {
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
          signUp: {
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

  describe('Mutation.signIn', () => {
    const query: string = `
      mutation($email: String!, $password: String!) {
        signIn(email: $email, password: $password) {
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
          signIn: {
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
        email: createFakeEmail(),
        password,
      };

      const { body: response } = await request
        .post('/')
        .send({ query, variables });

      expect(response).toEqual(
        expect.objectContaining({
          errors: [
            expect.objectContaining({
              message: 'You are not authorized.',
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
              message: 'You are not authorized.',
            }),
          ],
        }),
      );
    });
  });

  describe('Query.me', () => {
    const query: string = `
     {
        me {
          id
          email
          name
          roles
        }
      }
    `;

    it('Should return logged user', async () => {
      const { body: response } = await request
        .post('/')
        .set('Authorization', `Bearer ${token}`)
        .send({ query });

      expect(response).toEqual({
        data: {
          me: {
            id: expect.any(String),
            name: dbUsers.jonSnow.name,
            email: dbUsers.jonSnow.email,
            roles: dbUsers.jonSnow.roles,
          },
        },
      });
    });

    it('Should return error when user not loggedIn', async () => {
      const { body: response } = await request.post('/').send({ query });

      expect(response).toEqual(
        expect.objectContaining({
          errors: [
            expect.objectContaining({
              message: 'You are not authorized.',
            }),
          ],
        }),
      );
    });

    it('Should return error when user not exists', async () => {
      const { body: response } = await request
        .post('/')
        .set(
          'Authorization',
          `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1YmM5NDE1MTliODgyNTNiNzFmNWE1NjkiLCJpYXQiOjE1Mzk5MTY3NjN9.OQU2GoailFmxhQSNy6ahZk39cNDZC-z_vnovmPONO-4`,
        )
        .send({ query });

      expect(response).toEqual(
        expect.objectContaining({
          errors: [
            expect.objectContaining({
              message: 'You are not authorized.',
            }),
          ],
        }),
      );
    });
  });
});
