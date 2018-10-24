import { createError } from 'apollo-errors';

export const ForbiddenError = createError('ForbiddenError', {
  message: 'You are not allowed to do this.',
});
