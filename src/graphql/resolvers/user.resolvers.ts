import { User } from '../../models';
import { IUserDocument } from '../../models/user.model';
import {
  default as createAuthPayload,
  IAuthPayload,
} from '../../services/createAuthPayload';
import { IContext } from '../types/IContext';
import {
  baseResolver,
  isAdminResolver,
  isAuthenticatedResolver,
} from './common';
import { AuthorizationError } from '../errors/AuthorizationError';
import { EmailAlreadyExistsError } from '../errors/EmailAlreadyExistsError';
import { ForbiddenError } from '../errors/ForbiddenError';

export const isAdminOrOwneUserResolver = isAuthenticatedResolver.createResolver(
  (root, args, { user }) => {
    if (!User.isAdmin(user) && args.id !== user.id.toString()) {
      throw new ForbiddenError();
    }
  },
);

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
  { name, email, password }: any,
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
  });

  return createAuthPayload(user);
};

const meResolver = async (
  _: any,
  {},
  { user }: IContext,
): Promise<IUserDocument | undefined> => user;

const removeUserResolver = async (_: any, { id }: any): Promise<boolean> => {
  await User.findByIdAndDelete(id);
  return true;
};

const createUserResolver = async (
  _: any,
  { password, email, ...props }: any,
): Promise<IUserDocument> => {
  if (await User.getByEmail(email)) {
    throw new EmailAlreadyExistsError({
      message: `Has an user registered with this email: ${email}`,
    });
  }

  return await User.create({
    email,
    password: await User.generatePasswordHash(password),
    ...props,
  });
};

const updateUserResolver = async (
  _: any,
  { id, ...rest }: any,
): Promise<IUserDocument | null> => {
  if (
    rest.email !== undefined &&
    (await User.findOne({
      _id: { $ne: id },
      email: new RegExp(`^${rest.email}$`, 'i'),
    }))
  ) {
    throw new EmailAlreadyExistsError({
      message: `Has an user registered with this email: ${rest.email}`,
    });
  }

  return await User.findByIdAndUpdate(id, { $set: { ...rest } }, { new: true });
};

const changeUserPasswordResolver = async (
  _: any,
  { id, password }: any,
): Promise<boolean> => {
  const user: IUserDocument | null = await User.findById(id);

  user!.password = await User.generatePasswordHash(password);

  await user!.save();

  return true;
};

export default {
  Mutation: {
    signIn: baseResolver.createResolver(signInResolver),
    signUp: baseResolver.createResolver(signUpResolver),
    createUser: isAdminResolver.createResolver(createUserResolver),
    updateUser: isAdminOrOwneUserResolver.createResolver(updateUserResolver),
    removeUser: isAdminOrOwneUserResolver.createResolver(removeUserResolver),
    changeUserPassword: isAdminOrOwneUserResolver.createResolver(
      changeUserPasswordResolver,
    ),
  },
  Query: {
    me: isAuthenticatedResolver.createResolver(meResolver),
  },
};
