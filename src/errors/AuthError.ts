export class AuthError extends Error {
  constructor() {
    super('Not authorized');
  }
}
