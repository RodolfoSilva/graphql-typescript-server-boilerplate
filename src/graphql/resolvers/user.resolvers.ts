import { User } from '../../models';
import { IUserDocument } from '../../models/user.model';
import {
  default as createAuthPayload,
  IAuthPayload,
} from '../../services/createAuthPayload';
import { IContext } from '../types/IContext';
import { baseResolver, isAuthenticatedResolver } from './common';
import { AuthorizationError } from '../errors/AuthorizationError';
import { EmailAlreadyExistsError } from '../errors/EmailAlreadyExistsError';

const signInResolver = async (
  _: any,
  { email, password }: any,
): Promise<IAuthPayload> => {
  const user:
    | IUserDocument
    | undefined
    | null = await User.getByEmailAndPassword(email, password);

  if (!user) {
    throw new AuthorizationError();
  }

  return createAuthPayload(user);
};

const signUpResolver = async (
  _: any,
  { name, email, password, roles }: any,
): Promise<IAuthPayload> => {
  if (await User.getByEmail(email)) {
    throw new EmailAlreadyExistsError({
      message: `Has an user registered with this email: ${email}`,
    });
  }

  const user: IUserDocument | null = await User.create({
    email,
    name,
    password: await User.generatePasswordHash(password),
    roles,
  });

  return createAuthPayload(user);
};

const meResolver = async (
  _: any,
  {},
  { user }: IContext,
): Promise<IUserDocument | undefined> => user;

export default {
  Mutation: {
    signIn: baseResolver.createResolver(signInResolver),
    signUp: baseResolver.createResolver(signUpResolver),
  },
  Query: {
    me: isAuthenticatedResolver.createResolver(meResolver),
  },
};
