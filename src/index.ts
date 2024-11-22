console.log(`Entorno de: ${process.env.NODE_ENV}`);
require('dotenv').config({path: `.env.${process.env.NODE_ENV}`});

import {ApplicationConfig, Hansacrm4Application} from './application';
import { configEnv } from './middlewares';
export * from './application';

export async function main() {
  // insert ENV of NACOS
  await configEnv()
  const options = {
    rest: {
      port: +(process.env.PORT_LB01 ?? 50051),
      host: process.env.HOST,
      // The `gracePeriodForClose` provides a graceful close for http/https
      // servers with keep-alive clients. The default value is `Infinity`
      // (don't force-close). If you want to immediately destroy all sockets
      // upon stop, set its value to `0`.
      // See https://www.npmjs.com/package/stoppable
      gracePeriodForClose: 5000, // 5 seconds
      openApiSpec: {
        // useful when used with OpenAPI-to-GraphQL to locate your application
        setServersFromRequest: true,
      },
      requestCert: false,
      rejectUnauthorized: false
    },
  };
  // Run the application
  const app = await new Hansacrm4Application(options);
  await app.boot();
  await app.start();
  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);
  return app;
}

if (require.main === module) {
  main().catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
