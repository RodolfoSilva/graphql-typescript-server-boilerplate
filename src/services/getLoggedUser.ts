import { AuthError } from '../errors/AuthError';
import { IContext } from '../graphql/types/IContext';
import { IUserDocument } from '../models/user.model';

const getLoggedUser = async (context: IContext): Promise<IUserDocument> => {
  const user: IUserDocument | undefined = context.request.user;

  if (!user) {
    throw new AuthError();
  }

  return user;
};

export default getLoggedUser;
