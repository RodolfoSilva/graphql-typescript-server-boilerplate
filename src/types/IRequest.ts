import { Request } from 'express';
import { IUserDocument } from '../models/user.model';

export interface IRequest extends Request {
  user?: IUserDocument;
}
