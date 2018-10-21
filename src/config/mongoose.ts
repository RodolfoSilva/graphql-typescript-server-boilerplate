import createDebug, { IDebugger } from 'debug';
import mongoose from 'mongoose';
import * as vars from './vars';

const debug: IDebugger = createDebug('server');

mongoose.Promise = global.Promise;

if (!vars.isTest) {
  mongoose.connection.on('connected', () =>
    debug(`Mongoose default connection open to ${vars.mongo}`),
  );

  mongoose.connection.on('disconnected', () =>
    debug('Mongoose default connection disconnected'),
  );

  mongoose.connection.on('error', error => {
    debug(`Mongoose default connection error: ${error}`);
    process.exit(-1);
  });

  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      debug('Mongoose default connection disconnected through app termination');
      process.exit(0);
    });
  });
}

if (vars.isDevelopment) {
  mongoose.set('debug', true);
}

mongoose.set('useCreateIndex', true);

mongoose.connect(
  vars.mongo,
  {
    keepAlive: 1,
    useNewUrlParser: true,
  },
);
