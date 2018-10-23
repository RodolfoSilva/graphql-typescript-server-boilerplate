import { baseResolver } from './common';

const welcomeResolver = (_: any, { name }: any) => `Hello ${name || 'World'}`;

export default {
  Query: {
    welcome: baseResolver.createResolver(welcomeResolver),
  },
};
