import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';
const config = {
  name: 'HANSACRM',
  connector: 'mssql',
  url: '',
  host: process.env.SQL_HOST,
  port: Number(process.env.SQL_PORT),
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DATABASE,
  "options": {
    "encrypt": false,
    "enableArithAbort": true
  }
};
// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class HansacrmDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'HANSACRM';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.HANSACRM', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
