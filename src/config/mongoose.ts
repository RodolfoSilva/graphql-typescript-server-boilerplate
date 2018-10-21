import createDebug, { IDebugger } from 'debug';
import mongoose from 'mongoose';
import * as vars from './vars';

const debug: IDebugger = createDebug('server');

mongoose.Promise = global.Promise;

mongoose.connection.on('connected', () =>
  debug(`Mongoose default connection open to ${vars.mongo}`),
);

mongoose.connection.on('disconnected', () =>
  debug('Mongoose default connection disconnected'),
);

mongoose.connection.on('error', error => {
  debug(`Mongoose default connection error: ${error}`);
  process.exit(1);
});

mongoose.set('debug', vars.isDevelopment);

mongoose.set('useCreateIndex', true);

mongoose.connect(
  vars.mongo,
  {
    keepAlive: 1,
    useNewUrlParser: true,
  },
);
