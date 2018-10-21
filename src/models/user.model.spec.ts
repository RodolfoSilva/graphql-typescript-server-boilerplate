import faker from 'faker';
import User from './user.model';
import '../testServer';

describe('UserModel', () => {
  let dbUsers: any;
  let passwordHashed: string;
  const password = 'mypassword';

  beforeAll(async () => {
    passwordHashed = await User.generatePasswordHash(password);
  });

  beforeEach(async () => {
    if (dbUsers) {
      await User.deleteMany({
        email: { $in: [dbUsers.branStark.email, dbUsers.jonSnow.email] },
      });
    }

    dbUsers = {
      branStark: {
        email: faker.internet.email(faker.name.findName()).toLowerCase(),
        name: faker.name.findName(),
        password: passwordHashed,
        roles: ['user'],
      },
      jonSnow: {
        email: faker.internet.email(faker.name.findName()).toLowerCase(),
        name: faker.name.findName(),
        password: passwordHashed,
        roles: ['admin'],
      },
    };

    await User.insertMany(Object.values(dbUsers));
  });

  describe('User.getByEmail', () => {
    it('Should return a user', async () => {
      const user = await User.getByEmail(dbUsers.branStark.email);

      expect(user).toEqual(
        expect.objectContaining({
          name: dbUsers.branStark.name,
          email: dbUsers.branStark.email,
          roles: expect.arrayContaining(dbUsers.branStark.roles),
          password: passwordHashed,
        }),
      );
    });

    it('Should return null when a email is not provide', async () => {
      const user = await User.getByEmail('');
      expect(user).toBeNull();
    });

    it('Should return null when a email not exists', async () => {
      const user = await User.getByEmail('ctxls@caspadian.com');
      expect(user).toBeNull();
    });
  });

  describe('User.getByEmailAndPassword', () => {
    it('Should return a user', async () => {
      const user = await User.getByEmailAndPassword(
        dbUsers.branStark.email,
        password,
      );

      expect(user).toEqual(
        expect.objectContaining({
          name: dbUsers.branStark.name,
          email: dbUsers.branStark.email,
          roles: expect.arrayContaining(dbUsers.branStark.roles),
          password: passwordHashed,
        }),
      );
    });

    it('Should return null when a email is not provide', async () => {
      const user = await User.getByEmailAndPassword('', password);
      expect(user).toBeNull();
    });

    it('Should return null when a password is not provide', async () => {
      const user = await User.getByEmailAndPassword(
        dbUsers.branStark.email,
        '',
      );
      expect(user).toBeNull();
    });

    it('Should return null when a email is invalid', async () => {
      const user = await User.getByEmailAndPassword(
        'ctxls@caspadian.com',
        password,
      );
      expect(user).toBeNull();
    });

    it('Should return null when a password is invalid', async () => {
      const user = await User.getByEmailAndPassword(
        dbUsers.branStark.email,
        'My53cur173K3y',
      );
      expect(user).toBeNull();
    });
  });
});
