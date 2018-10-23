import { NextFunction, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import * as vars from '../config/vars';
import { Types } from 'mongoose';
import { User } from '../models';
import { IRequest } from '../types/IRequest';

const authMiddleware = async (
  req: IRequest,
  res: Response,
  next: NextFunction,
) => {
  const authorization = req.header('Authorization');

  if (authorization) {
    const token: string = authorization.trim().split(' ')[1];

    try {
      const { userId } = jwt.verify(token, vars.appSecret) as {
        userId: string;
      };

      const user = await User.findById(Types.ObjectId(userId));

      if (user) {
        req.user = user;
      }
    } catch (e) {
      next();
      return;
    }
  }

  next();
};

export default authMiddleware;
