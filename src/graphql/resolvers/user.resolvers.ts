import { AuthError } from '../../errors/AuthError';
import { User } from '../../models';
import { IUserDocument } from '../../models/user.model';
import {
  default as createAuthPayload,
  IAuthPayload,
} from '../../services/createAuthPayload';
import getLoggedUser from '../../services/getLoggedUser';
import { IContext } from '../types/Context';

export default {
  Mutation: {
    signin: async (_: any, { email, password }: any): Promise<IAuthPayload> => {
      const user:
        | IUserDocument
        | undefined
        | null = await User.getByEmailAndPassword(email, password);

      if (!user) {
        throw new AuthError();
      }

      return createAuthPayload(user);
    },
    signup: async (
      _: any,
      { name, email, password, roles }: any,
    ): Promise<IAuthPayload> => {
      if (await User.getByEmail(email)) {
        throw new Error(`Has an user registered with this email: ${email}`);
      }

      const user: IUserDocument | null = await User.create({
        email,
        name,
        password: await User.generatePasswordHash(password),
        roles,
      });
      return createAuthPayload(user);
    },
  },
  Query: {
    me: async (_: any, {}, ctx: IContext): Promise<IUserDocument> =>
      await getLoggedUser(ctx),
  },
};
