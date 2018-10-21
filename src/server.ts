import createDebug, { IDebugger } from 'debug';
import app from './app';
import './config/env';
import connectMongoose from './config/mongoose';

const debug: IDebugger = createDebug('server');

(async () => {
  await connectMongoose();

  await app.start();

  debug(
    `Server is running on localhost:%d and GraphQl Server on localhost:%d%s`,
    app.options.port,
    app.options.port,
    app.options.endpoint
  );
})();
