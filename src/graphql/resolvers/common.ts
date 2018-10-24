import { createResolver } from 'apollo-resolvers';
import { isInstance as isApolloErrorInstance } from 'apollo-errors';
import { UnknownError } from '../errors/UnknownError';
import { AuthorizationError } from '../errors/AuthorizationError';
import { ForbiddenError } from '../errors/ForbiddenError';
import { User } from '../../models';

export const baseResolver = createResolver(
  null,
  /* istanbul ignore next */
  (root, args, context, error) =>
    isApolloErrorInstance(error) ? error : new UnknownError(),
);

export const isAuthenticatedResolver = baseResolver.createResolver(
  (root, args, { user }) => {
    if (!user) {
      throw new AuthorizationError();
    }
  },
);

export const isAdminResolver = isAuthenticatedResolver.createResolver(
  (root, args, { user }) => {
    if (!User.isAdmin(user)) {
      throw new ForbiddenError();
    }
  },
);
