import createDebug, { IDebugger } from 'debug';
import app from './app';

const debug: IDebugger = createDebug('server');

(async () => {
  await app.start();

  debug(
    `Server is running on localhost:%d and GraphQl Server on localhost:%d%s`,
    app.options.port,
    app.options.port,
    app.options.endpoint,
  );
})();
