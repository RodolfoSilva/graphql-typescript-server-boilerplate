import createDebug, { IDebugger } from 'debug';
import { GraphQLServer } from 'graphql-yoga';
import { Options, Props } from 'graphql-yoga/dist/types';
import path from 'path';

import './config/env';
import connectMongoose from './config/mongoose';
import resolvers from './graphql/resolvers';
import './models';
import customRoutes from './routes';

(async () => {
  await connectMongoose();

  const debug: IDebugger = createDebug('server');

  const graphqlServerProps: Props = {
    context: req => ({
      ...req
    }),
    resolvers,
    typeDefs: path.join(__dirname, './graphql/schema.graphql')
  };

  const server = new GraphQLServer(graphqlServerProps);

  const serverOptions: Options = {
    port: Number(process.env.PORT)
  };

  server.use(customRoutes);

  server.start(serverOptions, options => {
    debug(
      `Server is running on localhost:%d and GraphQl Server on localhost:%d%s`,
      options.port,
      options.port,
      options.endpoint
    );
  });
})();
