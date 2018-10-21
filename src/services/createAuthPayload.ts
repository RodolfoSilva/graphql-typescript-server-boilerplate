import * as jwt from 'jsonwebtoken';
import { IUserDocument } from '../models/user.model';
import * as vars from '../config/vars';

export interface IAuthPayload {
  token: {
    access_token: string;
    token_type: string;
    expires_in: number;
  };
  user: IUserDocument;
}

export const createToken = (user: IUserDocument): string =>
  jwt.sign({ userId: user.id }, vars.appSecret);

const createAuthPayload = (user: IUserDocument) => {
  const accessToken: string = createToken(user);
  const { iat } = jwt.decode(accessToken) as { iat: number };

  return {
    token: {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: iat,
    },
    user,
  };
};

export default createAuthPayload;
