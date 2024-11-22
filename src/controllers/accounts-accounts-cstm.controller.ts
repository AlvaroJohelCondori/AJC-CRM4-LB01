import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
  Accounts,
  AccountsCstm,
} from '../models';
import {AccountsRepository} from '../repositories';

export class AccountsAccountsCstmController {
  constructor(
    @repository(AccountsRepository) protected accountsRepository: AccountsRepository,
  ) { }

  @get('/accounts/{id}/accounts-cstm', {
    responses: {
      '200': {
        description: 'Accounts has one AccountsCstm',
        content: {
          'application/json': {
            schema: getModelSchemaRef(AccountsCstm),
          },
        },
      },
    },
  })
  async get(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<AccountsCstm>,
  ): Promise<AccountsCstm> {
    return this.accountsRepository.accountsCstm(id).get(filter);
  
  }

  @post('/accounts/{id}/accounts-cstm', {
    responses: {
      '200': {
        description: 'Accounts model instance',
        content: {'application/json': {schema: getModelSchemaRef(AccountsCstm)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Accounts.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AccountsCstm, {
            title: 'NewAccountsCstmInAccounts',
            exclude: ['id_c'],
            optional: ['id_c']
          }),
        },
      },
    }) accountsCstm: Omit<AccountsCstm, 'id_c'>,
  ): Promise<AccountsCstm> {
    return this.accountsRepository.accountsCstm(id).create(accountsCstm);
  }

  @patch('/accounts/{id}/accounts-cstm', {
    responses: {
      '200': {
        description: 'Accounts.AccountsCstm PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AccountsCstm, {partial: true}),
        },
      },
    })
    accountsCstm: Partial<AccountsCstm>,
    @param.query.object('where', getWhereSchemaFor(AccountsCstm)) where?: Where<AccountsCstm>,
  ): Promise<Count> {
    return this.accountsRepository.accountsCstm(id).patch(accountsCstm, where);
  }

  @del('/accounts/{id}/accounts-cstm', {
    responses: {
      '200': {
        description: 'Accounts.AccountsCstm DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(AccountsCstm)) where?: Where<AccountsCstm>,
  ): Promise<Count> {
    return this.accountsRepository.accountsCstm(id).delete(where);
  }
}
