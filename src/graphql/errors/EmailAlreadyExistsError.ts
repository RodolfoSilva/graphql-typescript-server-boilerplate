import { createError } from 'apollo-errors';

export const EmailAlreadyExistsError = createError('EmailAlreadyExistsError', {
  message: 'The email already exists',
});
