import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {ServiceToken} from '../helpers/generar-jwt';
import {Users} from '../models';
import {UsersRepository} from '../repositories';
import * as querySQL from '../SQL';
export class UsersController {
  constructor(
    @repository(UsersRepository)
    public usersRepository: UsersRepository,
  ) {}

  // * SERVICIO PARA TRAER LA INFORMACIÓN DEL USUARIO CON SU TOKEN
  @get('/users/login/{id}')
  @response(200, {
    description: 'Usuario HANSCRM',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          title: 'PingResponse',
          properties: {
            user: {type: 'object'},
          },
        },
      },
    },
  })
  async login(@param.path.string('id') id: string): Promise<object> {
    const userCRM = await this.getUserInfoToken(id);
    const token = await new ServiceToken().generarJWT(userCRM);
    return {
      userCRM,
      token,
    };
  }
  // * END

  @get('/user-session/{id}')
  @response(200, {
    description: 'Obtener la informacion del usuario en formato de token',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          title: 'User toker format',
          properties: {
            user: {type: 'object'},
          },
        },
      },
    },
  })
  async getUserInfoToken(
    @param.path.string('id', {example: '0BA5C53C-57E2-4A8E-B546-F33B4A540BB', description: 'Id del usuario HANSACRM'}) id?: string, 
  ): Promise<object> {
    try {
      //*OBTENEMOS LA INFORMACION DEL USUARIO LOGUEADO
      const sql = `${querySQL.users.Users_Get_Session} '${id}'`;
      const user = await this.usersRepository.execute(sql);
      const userCRM = user[0];

      //*OBTENEMOS EL ROL PRINCIPAL DEL USUARIO LOGUEADO
      const query_rol = `${querySQL.users.ACL_Roles_Actions} 'acl_roles','${id}','','','1'`;
      const result_rol = await this.usersRepository.execute(query_rol);
      if(result_rol.length > 0){
        userCRM.user_rol = result_rol[0]
      }else{
        userCRM.user_rol = ''
      }
      return userCRM;
    } catch (error) {
      console.log(error);
      return error;
    }
    
  }

  @post('/users')
  @response(200, {
    description: 'Users model instance',
    content: {'application/json': {schema: getModelSchemaRef(Users)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Users, {
            title: 'NewUsers',
            //exclude: ['id'],
          }),
        },
      },
    })
    users: Omit<Users, 'id'>,
  ): Promise<Users> {
    return this.usersRepository.create(users);
  }

  @get('/users/count')
  @response(200, {
    description: 'Users model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Users) where?: Where<Users>): Promise<Count> {
    return this.usersRepository.count(where);
  }

  @get('/users')
  @response(200, {
    description: 'Array of Users model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Users, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Users) filter?: Filter<Users>): Promise<Users[]> {
    return this.usersRepository.find(filter);
  }

  @patch('/users')
  @response(200, {
    description: 'Users PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Users, {partial: true}),
        },
      },
    })
    users: Users,
    @param.where(Users) where?: Where<Users>,
  ): Promise<Count> {
    return this.usersRepository.updateAll(users, where);
  }

  @get('/users/{id}')
  @response(200, {
    description: 'Users model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Users, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Users, {exclude: 'where'})
    filter?: FilterExcludingWhere<Users>,
  ): Promise<Users> {
    return this.usersRepository.findById(id, filter);
  }

  @patch('/users/{id}')
  @response(204, {
    description: 'Users PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Users, {partial: true}),
        },
      },
    })
    users: Users,
  ): Promise<void> {
    await this.usersRepository.updateById(id, users);
  }

  @put('/users/{id}')
  @response(204, {
    description: 'Users PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() users: Users,
  ): Promise<void> {
    await this.usersRepository.replaceById(id, users);
  }

  @del('/users/{id}')
  @response(204, {
    description: 'Users DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.usersRepository.deleteById(id);
  }

  /**
   * ? Get List Accounts with paginations, sortBy, Order, and Filter by [nombre, nit, codaio, tipocuenta, asignado_a]
   * @param params
   * @returns
   */
  @get('/Users-search/{filter}')
  @response(200, {
    description: 'Search Users List Users HANSACRM ,[filter]',
    content: {
      'application/json': {
        schema: {
          type: 'json',
          title: 'PingResponse',
        },
      },
    },
  })
  async getListUsers(
    // @param.query.object('params', {
    //   type: 'object',
    //   properties: {
    //     filter: {
    //       type: 'string'
    //     }
    //   }
    // }) params: {
    //   filter: string
    // }
    @param.path.string('filter') filter: string,
  ): Promise<object> {
    //const {filter} = params
    const sql = `EXEC [${process.env.SQL_DATABASE}].[crm4].[Users_Search_List] '${filter}'`;
    const data = await this.usersRepository.execute(sql);
    return {
      data,
    };
  }

  /**
   * ! Search List Users filtered by division and amercado
   * @param params
   * @returns
   */
  @get('/users/division/amercado')
  @response(200, {
    description:
      'Users By division, areamercado  HANSACRM ,[division, area_mercado]',
    content: {
      'application/json': {
        schema: {
          type: 'json',
          title: 'PingResponse',
        },
      },
    },
  })
  async getUserByDivisionAmercado(
    @param.query.object('params', {
      type: 'object',
      properties: {
        division: {
          type: 'string',
        },
        a_mercado: {
          type: 'string',
        },
      },
    })
    params: {
      division: string;
      a_mercado: string;
    },
  ): Promise<object> {
    const {division = '', a_mercado = ''} = params;
    console.log('params :>> ', params);
    const sql = `EXEC [${process.env.SQL_DATABASE}].[crm4].[Users_By_Division_Amercado] '${division}','${a_mercado}'`;

    try {
      const data = await this.usersRepository.execute(sql);
      return {
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * !Recibe como parametro el id de la division del logueado
   * @param division
   * @returns
   */
  @get('/users_list_division/{division}')
  @response(200, {
    description: 'Users list by division code HANSACRM ,[division]',
    content: {
      'application/json': {
        schema: {
          type: 'json',
          title: 'PingResponse',
        },
      },
    },
  })
  async getListUsersByDivision(
    @param.path.string('division') division: string,
  ): Promise<object> {
    const sql = `EXEC [${process.env.SQL_DATABASE}].[crm4].[Users_Get_List_By_Division] '${division}'`;
    const data = await this.usersRepository.execute(sql);
    return {
      data,
    };
  }
}
