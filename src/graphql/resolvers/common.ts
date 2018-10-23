import { createResolver } from 'apollo-resolvers';
import { isInstance } from 'apollo-errors';
import { UnknownError } from '../errors/UnknownError';
import { AuthorizationError } from '../errors/AuthorizationError';

export const baseResolver = createResolver(
  null,
  /* istanbul ignore next */
  (root, args, context, error) =>
    isInstance(error) ? error : new UnknownError(),
);

export const isAuthenticatedResolver = baseResolver.createResolver(
  (root, args, { user }) => {
    if (!user) {
      throw new AuthorizationError();
    }
  },
);
