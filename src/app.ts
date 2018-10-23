import { GraphQLServer } from 'graphql-yoga';
import { Props } from 'graphql-yoga/dist/types';
import path from 'path';

import './config/vars';

import './config/mongoose';
import resolvers from './graphql/resolvers';
import './models';
import customRoutes from './routes';
import authMiddleware from './middlewares/auth';

const graphqlServerProps: Props = {
  context: (req: any) => ({
    ...req,
    user: req.request.user,
  }),
  resolvers,
  typeDefs: path.join(__dirname, './graphql/schema.graphql'),
};

const app = new GraphQLServer(graphqlServerProps);

app.use(authMiddleware);

app.use(customRoutes);

export default app;
