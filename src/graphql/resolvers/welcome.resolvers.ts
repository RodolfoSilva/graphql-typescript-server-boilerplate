export default {
  Query: {
    welcome: (_: any, { name }: any) => `Hello ${name || 'World'}`
  }
};
