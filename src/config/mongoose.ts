import createDebug, { IDebugger } from 'debug';
import mongoose from 'mongoose';

const debug: IDebugger = createDebug('server');

const { MONGO_URI, NODE_ENV } = process.env as {
  MONGO_URI: string;
  NODE_ENV: string;
};

if (!NODE_ENV) {
  throw new Error(
    'The NODE_ENV environment variable is required but was not specified.',
  );
}

mongoose.Promise = global.Promise;

if (NODE_ENV !== 'test') {
  mongoose.connection.on('connected', () =>
    debug(`Mongoose default connection open to ${MONGO_URI}`),
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

if (NODE_ENV === 'development') {
  mongoose.set('debug', true);
}

mongoose.set('useCreateIndex', true);

if (!MONGO_URI) {
  throw new Error(
    'The MONGO_URI environment variable is required but was not specified.',
  );
}

mongoose.connect(
  MONGO_URI,
  {
    keepAlive: 1,
    useNewUrlParser: true,
  },
);
