import * as jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { AuthError } from '../errors/AuthError';
import { IContext } from '../graphql/types/Context';
import * as vars from '../config/vars';

const getLoggedUserId = ({ request }: IContext): Types.ObjectId => {
  const authorization = request.get('Authorization');

  if (!authorization) {
    throw new AuthError();
  }

  const token: string = authorization.trim().split(' ')[1];

  const { userId } = jwt.verify(token, vars.appSecret) as { userId: string };
  return Types.ObjectId(userId);
};

export default getLoggedUserId;
