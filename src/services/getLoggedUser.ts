import { Types } from 'mongoose';
import { AuthError } from '../errors/AuthError';
import { IContext } from '../graphql/types/Context';
import { User } from '../models';
import { IUserDocument } from '../models/user.model';
import getLoggedUserId from './getLoggedUserId';

const getLoggedUser = async (context: IContext): Promise<IUserDocument> => {
  const userId: Types.ObjectId = getLoggedUserId(context);
  const user: IUserDocument | null = await User.findById(userId);

  if (!user) {
    throw new AuthError();
  }

  return user;
};

export default getLoggedUser;
