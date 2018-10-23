import { ContextParameters } from 'graphql-yoga/dist/types';
import { IRequest } from '../../types/IRequest';

export interface IContext extends ContextParameters {
  request: IRequest;
}
