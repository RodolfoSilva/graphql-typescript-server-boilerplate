import { Request, Response } from 'express';
import { createToken } from '../services/createAuthPayload';
import { User } from '../models';
import { IUserDocument } from '../models/user.model';
import authMiddleware from './auth';
import '../testServer';
import { createFakeEmail, createFakePersonName } from '../utils/testHelpers';

describe('Auth middleware', () => {
  let passwordHashed: string;
  let user: any;
  let token: string;
  const password = 'mypassword';

  beforeAll(async () => {
    passwordHashed = await User.generatePasswordHash(password);
  });

  beforeEach(async () => {
    if (user) {
      await User.deleteMany({
        email: {
          $in: [user.email],
        },
      });
    }

    user = {
      email: createFakeEmail(),
      name: createFakePersonName(),
      password: passwordHashed,
      roles: ['admin'],
    };

    await User.insertMany([user]);
    const dbUser = await User.findOne({ email: user.email });

    token = await createToken(dbUser as IUserDocument);
  });

  it('Should execute next function', async () => {
    const next = jest.fn();
    const req: Request = {
      header: jest.fn() as any,
    } as Request;
    const res: Response = {} as Response;

    await authMiddleware(req, res, next);

    expect(next).toBeCalledTimes(1);
    expect(req).not.toHaveProperty('user');
    expect(res).toEqual({});
  });

  it('Should mutate request with logged user and execute next', async () => {
    const next = jest.fn();
    const req: Request = {
      header: jest.fn((header): string => `Bearer ${token}`) as any,
    } as Request;
    const res: Response = {} as Response;

    await authMiddleware(req, res, next);

    expect(next).toBeCalledTimes(1);
    expect(req.header).toBeCalledWith('Authorization');
    expect(req).toEqual(
      expect.objectContaining({
        user: expect.objectContaining({
          id: expect.any(String),
          name: user.name,
          email: user.email,
          roles: expect.arrayContaining(user.roles),
        }),
      }),
    );
    expect(res).toEqual({});
  });

  it('Should not mutate request when token user not exists and execute next without error', async () => {
    const next = jest.fn();
    const invalidToken = await createToken(
      new User({ email: createFakeEmail() }),
    );
    const req: Request = {
      header: jest.fn((header): string => `Bearer ${invalidToken}`) as any,
    } as Request;
    const res: Response = {} as Response;

    await authMiddleware(req, res, next);

    expect(next).toBeCalledTimes(1);
    expect(req.header).toBeCalledWith('Authorization');
    expect(req).not.toHaveProperty('user');
    expect(res).toEqual({});
  });

  it('Should not mutate request when token is invalid and execute next without error', async () => {
    const next = jest.fn();
    const req: Request = {
      header: jest.fn(
        (header): string => `Bearer jkashuadausdhu912g1g22h`,
      ) as any,
    } as Request;
    const res: Response = {} as Response;

    await authMiddleware(req, res, next);

    expect(next).toBeCalledTimes(1);
    expect(req.header).toBeCalledWith('Authorization');
    expect(req).not.toHaveProperty('user');
    expect(res).toEqual({});
  });
});
