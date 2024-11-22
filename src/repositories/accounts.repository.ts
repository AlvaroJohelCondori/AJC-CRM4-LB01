import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasOneRepositoryFactory} from '@loopback/repository';
import {HansacrmDataSource} from '../datasources';
import {Accounts, AccountsRelations, AccountsCstm} from '../models';
import {AccountsCstmRepository} from './accounts-cstm.repository';

export class AccountsRepository extends DefaultCrudRepository<
  Accounts,
  typeof Accounts.prototype.id,
  AccountsRelations
> {

  public readonly accountsCstm: HasOneRepositoryFactory<AccountsCstm, typeof Accounts.prototype.id>;

  constructor(
    @inject('datasources.HANSACRM') dataSource: HansacrmDataSource, @repository.getter('AccountsCstmRepository') protected accountsCstmRepositoryGetter: Getter<AccountsCstmRepository>,
  ) {
    super(Accounts, dataSource);
    this.accountsCstm = this.createHasOneRepositoryFactoryFor('accountsCstm', accountsCstmRepositoryGetter);
    this.registerInclusionResolver('accountsCstm', this.accountsCstm.inclusionResolver);
  }
}
