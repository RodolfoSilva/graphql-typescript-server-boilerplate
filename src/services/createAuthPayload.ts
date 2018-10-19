import * as jwt from 'jsonwebtoken';
import { IUserDocument } from '../models/user.model';

const { APP_SECRET } = process.env as { APP_SECRET: string };

if (!APP_SECRET) {
  throw new Error(
    'The APP_SECRET environment variable is required but was not specified.'
  );
}

export interface IAuthPayload {
  token: string;
  user: IUserDocument;
}

const createAuthPayload = (user: IUserDocument) => ({
  token: jwt.sign({ userId: user.id }, APP_SECRET),
  user
});

export default createAuthPayload;
