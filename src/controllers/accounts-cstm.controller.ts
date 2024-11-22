import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {AccountsCstm} from '../models';
import {AccountsCstmRepository} from '../repositories';

export class AccountsCstmController {
  constructor(
    @repository(AccountsCstmRepository)
    public accountsCstmRepository : AccountsCstmRepository,
  ) {}

  @post('/accounts-cstms')
  @response(200, {
    description: 'AccountsCstm model instance',
    content: {'application/json': {schema: getModelSchemaRef(AccountsCstm)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AccountsCstm, {
            title: 'NewAccountsCstm',
            //exclude: ['id_c'],
          }),
        },
      },
    })
    accountsCstm: Omit<AccountsCstm, 'id_c'>,
  ): Promise<AccountsCstm> {
    return this.accountsCstmRepository.create(accountsCstm);
  }

  @get('/accounts-cstms/count')
  @response(200, {
    description: 'AccountsCstm model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(AccountsCstm) where?: Where<AccountsCstm>,
  ): Promise<Count> {
    return this.accountsCstmRepository.count(where);
  }

  @get('/accounts-cstms')
  @response(200, {
    description: 'Array of AccountsCstm model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(AccountsCstm, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(AccountsCstm) filter?: Filter<AccountsCstm>,
  ): Promise<AccountsCstm[]> {
    return this.accountsCstmRepository.find(filter);
  }

  @patch('/accounts-cstms')
  @response(200, {
    description: 'AccountsCstm PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AccountsCstm, {partial: true}),
        },
      },
    })
    accountsCstm: AccountsCstm,
    @param.where(AccountsCstm) where?: Where<AccountsCstm>,
  ): Promise<Count> {
    return this.accountsCstmRepository.updateAll(accountsCstm, where);
  }

  @get('/accounts-cstms/{id}')
  @response(200, {
    description: 'AccountsCstm model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(AccountsCstm, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(AccountsCstm, {exclude: 'where'}) filter?: FilterExcludingWhere<AccountsCstm>
  ): Promise<AccountsCstm> {
    return this.accountsCstmRepository.findById(id, filter);
  }

  @patch('/accounts-cstms/{id}')
  @response(204, {
    description: 'AccountsCstm PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AccountsCstm, {partial: true}),
        },
      },
    })
    accountsCstm: AccountsCstm,
  ): Promise<void> {
    await this.accountsCstmRepository.updateById(id, accountsCstm);
  }

  @put('/accounts-cstms/{id}')
  @response(204, {
    description: 'AccountsCstm PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() accountsCstm: AccountsCstm,
  ): Promise<void> {
    await this.accountsCstmRepository.replaceById(id, accountsCstm);
  }

  @del('/accounts-cstms/{id}')
  @response(204, {
    description: 'AccountsCstm DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.accountsCstmRepository.deleteById(id);
  }
}
