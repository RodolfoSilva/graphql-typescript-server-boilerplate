import * as jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { AuthError } from '../errors/AuthError';
import { IContext } from '../graphql/types/Context';

const { APP_SECRET } = process.env as { APP_SECRET: string };

if (!APP_SECRET) {
  throw new Error(
    'The APP_SECRET environment variable is required but was not specified.'
  );
}

const getLoggedUserId = ({ request }: IContext): Types.ObjectId => {
  const authorization = request.get('Authorization');

  if (!authorization) {
    throw new AuthError();
  }

  const token: string = authorization.trim().split(' ')[1];

  const { userId } = jwt.verify(token, APP_SECRET) as { userId: string };
  return Types.ObjectId(userId);
};

export default getLoggedUserId;
