import createDebug, { IDebugger } from 'debug';
import mongoose, { Connection } from 'mongoose';

const debug: IDebugger = createDebug('server');

const { MONGO_URI } = process.env as { MONGO_URI: string };

mongoose.Promise = global.Promise;

mongoose.set('useCreateIndex', true);

mongoose.connection.on('connected', () =>
  debug(`Mongoose default connection open to ${MONGO_URI}`)
);

mongoose.connection.on('disconnected', () =>
  debug('Mongoose default connection disconnected')
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

if (process.env.NODE_ENV === 'development') {
  mongoose.set('debug', true);
}

const connect = async (): Promise<Connection> => {
  if (!MONGO_URI) {
    throw new Error(
      'The MONGO_URI environment variable is required but was not specified.'
    );
  }

  await mongoose.connect(
    MONGO_URI,
    {
      keepAlive: 1,
      useNewUrlParser: true
    }
  );

  return mongoose.connection;
};

export default connect;
