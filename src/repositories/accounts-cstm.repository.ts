import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {HansacrmDataSource} from '../datasources';
import {AccountsCstm, AccountsCstmRelations} from '../models';

export class AccountsCstmRepository extends DefaultCrudRepository<
  AccountsCstm,
  typeof AccountsCstm.prototype.id_c,
  AccountsCstmRelations
> {
  constructor(
    @inject('datasources.HANSACRM') dataSource: HansacrmDataSource,
  ) {
    super(AccountsCstm, dataSource);
  }
}
