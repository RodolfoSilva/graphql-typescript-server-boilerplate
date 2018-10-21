import * as jwt from 'jsonwebtoken';
import { IUserDocument } from '../models/user.model';

const { APP_SECRET } = process.env as { APP_SECRET: string };

if (!APP_SECRET) {
  throw new Error(
    'The APP_SECRET environment variable is required but was not specified.',
  );
}

export interface IAuthPayload {
  token: {
    access_token: string;
    token_type: string;
    expires_in: number;
  };
  user: IUserDocument;
}

export const createToken = (user: IUserDocument): string =>
  jwt.sign({ userId: user.id }, APP_SECRET);

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
