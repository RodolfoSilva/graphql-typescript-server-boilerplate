import { ContextParameters } from 'graphql-yoga/dist/types';
import { IRequest } from '../../types/IRequest';
import { IUserDocument } from '../../models/user.model';

export interface IContext extends ContextParameters {
  request: IRequest;
  user?: IUserDocument;
}
