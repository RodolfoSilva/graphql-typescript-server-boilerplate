import { GraphQLServer } from 'graphql-yoga';
import { Props } from 'graphql-yoga/dist/types';
import path from 'path';

import './config/env';

import './config/mongoose';
import resolvers from './graphql/resolvers';
import './models';
import customRoutes from './routes';

const graphqlServerProps: Props = {
  context: req => ({
    ...req,
  }),
  resolvers,
  typeDefs: path.join(__dirname, './graphql/schema.graphql'),
};

const app = new GraphQLServer(graphqlServerProps);

app.use(customRoutes);

export default app;
