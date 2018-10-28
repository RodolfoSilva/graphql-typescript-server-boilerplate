import superTest from 'supertest';
import { User } from '../../models';
import { IUserDocument, Roles } from '../../models/user.model';
import { createToken } from '../../services/createAuthPayload';
import serverInstance from '../../testServer';
import { createFakeEmail, createFakePersonName } from '../../utils/testHelpers';
import { Types } from 'mongoose';
import uuid from 'uuid/v4';

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
      ariaStark: {
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
      mutation($name: String, $email: String!, $password: String!) {
        signUp(name: $name, email: $email, password: $password) {
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
              roles: [Roles.USER],
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

  describe('Mutation.createUser', () => {
    const query: string = `
      mutation($name: String, $email: String!, $password: String!, $roles: [String!]!) {
        createUser(name: $name, email: $email, password: $password, roles: $roles) {
          id
          email
          name
          roles
        }
      }
    `;

    it('Should return error when user not loggedIn', async () => {
      const { body: response } = await request
        .post('/')
        .send({ query, variables: user });

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

    it('Should return error when user not is admin', async () => {
      const branStark = (await User.findOne({
        email: dbUsers.branStark.email,
      }).exec()) as IUserDocument;

      const branStarkToken: string = await createToken(
        branStark as IUserDocument,
      );

      const { body: response } = await request
        .post('/')
        .set('Authorization', `Bearer ${branStarkToken}`)
        .send({ query, variables: user });

      expect(response).toEqual(
        expect.objectContaining({
          errors: [
            expect.objectContaining({
              message: 'You are not allowed to do this.',
            }),
          ],
        }),
      );
    });

    it('Should create a user', async () => {
      const { body: response } = await request
        .post('/')
        .set('Authorization', `Bearer ${token}`)
        .send({ query, variables: user });

      expect(response).toEqual({
        data: {
          createUser: {
            id: expect.any(String),
            name: user.name,
            email: user.email,
            roles: user.roles,
          },
        },
      });
    });

    it('Should return error when email already exists', async () => {
      const variables = dbUsers.jonSnow;

      const { body: response } = await request
        .post('/')
        .set('Authorization', `Bearer ${token}`)
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

  describe('Mutation.updateUser', () => {
    const query: string = `
      mutation($id: ID!, $name: String, $email: String, $roles: [String!]) {
        updateUser(id: $id, name: $name, email: $email, roles: $roles) {
          id
          email
          name
          roles
        }
      }
    `;

    it('Should return error when user not loggedIn', async () => {
      const branStark = (await User.findOne({
        email: dbUsers.branStark.email,
      }).exec()) as IUserDocument;

      const variables = {
        id: branStark.id,
        email: branStark.email,
        name: createFakePersonName(),
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

    it('Should return error when user not is admin', async () => {
      const branStark = (await User.findOne({
        email: dbUsers.branStark.email,
      }).exec()) as IUserDocument;
      const jonSnow = (await User.findOne({
        email: dbUsers.jonSnow.email,
      }).exec()) as IUserDocument;

      const variables = {
        id: jonSnow.id,
        email: jonSnow.email,
        name: createFakePersonName(),
      };

      const branStarkToken: string = await createToken(
        branStark as IUserDocument,
      );

      const { body: response } = await request
        .post('/')
        .set('Authorization', `Bearer ${branStarkToken}`)
        .send({ query, variables });

      expect(response).toEqual(
        expect.objectContaining({
          errors: [
            expect.objectContaining({
              message: 'You are not allowed to do this.',
            }),
          ],
        }),
      );
    });

    it('Should update user when user not is an admin but is the same edited user', async () => {
      const branStark = (await User.findOne({
        email: dbUsers.branStark.email,
      }).exec()) as IUserDocument;

      const variables = {
        id: branStark.id,
        email: branStark.email,
        name: createFakePersonName(),
      };

      const branStarkToken: string = await createToken(
        branStark as IUserDocument,
      );

      const { body: response } = await request
        .post('/')
        .set('Authorization', `Bearer ${branStarkToken}`)
        .send({ query, variables });

      expect(response).toEqual({
        data: {
          updateUser: {
            id: branStark.id,
            name: variables.name,
            email: branStark.email,
            roles: expect.arrayContaining(branStark.roles),
          },
        },
      });
    });

    it('Should update the user', async () => {
      const branStark = (await User.findOne({
        email: dbUsers.branStark.email,
      }).exec()) as IUserDocument;

      const variables = {
        id: branStark.id,
        name: createFakePersonName(),
      };

      const { body: response } = await request
        .post('/')
        .set('Authorization', `Bearer ${token}`)
        .send({ query, variables });

      expect(response).toEqual({
        data: {
          updateUser: {
            id: branStark.id,
            name: variables.name,
            email: branStark.email,
            roles: expect.arrayContaining(branStark.roles),
          },
        },
      });
    });

    it('Should return error when email already exists', async () => {
      const branStark = (await User.findOne({
        email: dbUsers.branStark.email,
      }).exec()) as IUserDocument;

      const variables = {
        id: branStark.id,
        email: dbUsers.jonSnow.email,
        name: createFakePersonName(),
      };

      const { body: response } = await request
        .post('/')
        .set('Authorization', `Bearer ${token}`)
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

  describe('Mutation.changeUserPassword', () => {
    const query: string = `
      mutation($id: ID!, $password: String!) {
        changeUserPassword(id: $id, password: $password)
      }
    `;

    it('Should return error when user not loggedIn', async () => {
      const branStark = (await User.findOne({
        email: dbUsers.branStark.email,
      }).exec()) as IUserDocument;

      const variables = {
        id: branStark.id,
        password: uuid(),
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

    it('Should return error when user not is admin', async () => {
      const branStark = (await User.findOne({
        email: dbUsers.branStark.email,
      }).exec()) as IUserDocument;
      const jonSnow = (await User.findOne({
        email: dbUsers.jonSnow.email,
      }).exec()) as IUserDocument;

      const variables = {
        id: jonSnow.id,
        password: uuid(),
      };

      const branStarkToken: string = await createToken(
        branStark as IUserDocument,
      );

      const { body: response } = await request
        .post('/')
        .set('Authorization', `Bearer ${branStarkToken}`)
        .send({ query, variables });

      expect(response).toEqual(
        expect.objectContaining({
          errors: [
            expect.objectContaining({
              message: 'You are not allowed to do this.',
            }),
          ],
        }),
      );
    });

    it('Should update user when user not is an admin but is the same edited user', async () => {
      const branStark = (await User.findOne({
        email: dbUsers.branStark.email,
      }).exec()) as IUserDocument;

      const variables = {
        id: branStark.id,
        password: uuid(),
      };

      const branStarkToken: string = await createToken(
        branStark as IUserDocument,
      );

      const { body: response } = await request
        .post('/')
        .set('Authorization', `Bearer ${branStarkToken}`)
        .send({ query, variables });

      expect(response).toEqual(
        expect.objectContaining({
          data: expect.objectContaining({
            changeUserPassword: true,
          }),
        }),
      );
    });

    it('Should change an user password', async () => {
      const branStark = (await User.findOne({
        email: dbUsers.branStark.email,
      }).exec()) as IUserDocument;

      const variables = {
        id: branStark.id,
        password: uuid(),
      };

      const { body: response } = await request
        .post('/')
        .set('Authorization', `Bearer ${token}`)
        .send({ query, variables });

      expect(response).toEqual(
        expect.objectContaining({
          data: expect.objectContaining({
            changeUserPassword: true,
          }),
        }),
      );
    });
  });

  describe('Mutation.removeUser', () => {
    const query: string = `
      mutation($id: ID!) {
        removeUser(id: $id)
      }
    `;

    it('Should return error when user not loggedIn', async () => {
      const dbUser = (await User.findOne({
        email: dbUsers.jonSnow.email,
      })) as IUserDocument;
      const variables = {
        id: dbUser._id,
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

    it('Should return error when user not is admin', async () => {
      const [branStark, ariaStark] = await Promise.all([
        User.findOne({ email: dbUsers.branStark.email }).exec() as Promise<
          IUserDocument
        >,
        User.findOne({ email: dbUsers.ariaStark.email }).exec() as Promise<
          IUserDocument
        >,
      ]);

      const branStarkToken: string = await createToken(
        branStark as IUserDocument,
      );

      const variables = {
        id: ariaStark._id,
      };

      const { body: response } = await request
        .post('/')
        .set('Authorization', `Bearer ${branStarkToken}`)
        .send({ query, variables });

      expect(response).toEqual(
        expect.objectContaining({
          errors: [
            expect.objectContaining({
              message: 'You are not allowed to do this.',
            }),
          ],
        }),
      );
    });

    it('Should remove a user', async () => {
      const dbUser = (await User.findOne({
        email: dbUsers.jonSnow.email,
      })) as IUserDocument;
      const variables = {
        id: dbUser._id,
      };

      const { body: response } = await request
        .post('/')
        .set('Authorization', `Bearer ${token}`)
        .send({ query, variables });

      expect(response).toEqual(
        expect.objectContaining({
          data: expect.objectContaining({
            removeUser: true,
          }),
        }),
      );

      const result = (await User.findOne({
        email: dbUsers.jonSnow.email,
      })) as IUserDocument;

      expect(result).toBeNull();
    });

    it('Should return true whe user not exists', async () => {
      const variables = {
        id: new Types.ObjectId(),
      };

      const { body: response } = await request
        .post('/')
        .set('Authorization', `Bearer ${token}`)
        .send({ query, variables });

      expect(response).toEqual(
        expect.objectContaining({
          data: expect.objectContaining({
            removeUser: true,
          }),
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
