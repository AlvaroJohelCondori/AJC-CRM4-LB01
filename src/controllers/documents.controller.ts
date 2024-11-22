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
  HttpErrors,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {DocumentsRepository} from '../repositories';
import { Documents } from '../models/documents.model';
export class DocumentsController {

  constructor(
    @repository(DocumentsRepository)
    public documentsRepository: DocumentsRepository,
  ) { }

  // * SERVICIO PARA TRAER LA INFORMACIÓN DE LAS DOCUMENTOS
  @get('/documents-viewList')
  @response(200, {
    description: 'Listado de documentos HANSACRM',
    content: {
      'application/json': {
        schema: {
          type: 'json',
          title: 'PingResponse',
        },
      },
    },
  })
  async getlist(
    @param.query.object('params', {
      type: 'object',
      properties: {
        page: {
          type: 'number'
        },
        rowsPerPage: {
          type: 'number'
        },
        filter: {
          type: 'string'
        },
        sortBy: {
          type: 'string'
        },
        order: {
          type: 'string'
        },
      }
    }) params: {
      page: number,
      rowsPerPage: number,
      filter: string,
      sortBy: string,
      order: string,
    }
  ): Promise<object> {
    const {page, rowsPerPage, filter, sortBy, order} = params
    const sql = `EXEC [${process.env.SQL_DATABASE}].[crm4].[Documents_Get_List] ${page},${rowsPerPage},'${filter}','${sortBy}','${order}'`;
    const data = await this.documentsRepository.execute(sql);
    console.log(data);
    return {
      data
    }
  }
  // END

  // * GET total Accounts in one number
  @get('/documents-total')
  @response(200, {
    description: 'Get total Documents HANSACRM',
    content: {
      'application/json': {
        schema: {
          type: 'json',
          title: 'PingResponse',
        },
      },
    },
  })
  async gettotal(
    @param.query.object('filter', {
      type: 'object',
      properties: {
        filter: {
          type: 'string'
        }
      }
    }) params: {
      filter: string,
    }
  ): Promise<object> {
    const {filter} = params
    const sql = `EXEC [${process.env.SQL_DATABASE}].[crm4].[Contacts_Get_Total] '${filter}'`;
    const data = await this.documentsRepository.execute(sql);
    return data[0].total
  }
  // * END

  // * GET service to bring the information of an account
  @get('/documents-getDocuments/{id}')
  @response(200, {
    description: 'Get Documents HANSACRM',
    content: {
      'application/json': {
        schema: {
          type: 'json',
          title: 'PingResponse',
        },
      },
    },
  })
  async getDocuments(
    @param.path.string('id') id: string,
  ): Promise<object> {
    const sql = `EXEC [${process.env.SQL_DATABASE}].[crm4].[Contacts_Get_ToSeeContact] '${id}'`;
    const data = await this.documentsRepository.execute(sql);
    return {
      data
    }
  }
  // * END

  // * GET service to bring the information of an account
  @get('/documents-getRelationDoc/{id}')
  @response(200, {
    description: 'Get documents HANSACRM',
    content: {
      'application/json': {
        schema: {
          type: 'json',
          title: 'PingResponse',
        },
      },
    },
  })
  async getRelationDocuments(
    @param.path.string('id') id: string,
  ): Promise<object> {
    const sql = `EXEC [${process.env.SQL_DATABASE}].[crm4].[ContactsDocuments_Get_List] '${id}'`;
    const data = await this.documentsRepository.execute(sql);
    return {
      data
    }
  }
  // * END

  //! CRUD POR DEFECTO DE LOOPBACK
  @post('/documents')
  @response(200, {
    description: 'Documents model instance',
    content: {'application/json': {schema: getModelSchemaRef(Documents)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Documents, {
            title: 'NewDocuments',
            //exclude: ['id'],
          }),
        },
      },
    })
    documents: Omit<Documents, 'id'>,
  ): Promise<Documents> {
    return this.documentsRepository.create(documents);
  }

  @get('/documents/count')
  @response(200, {
    description: 'Documents model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Documents) where?: Where<Documents>): Promise<Count> {
    return this.documentsRepository.count(where);
  }

  @get('/documents')
  @response(200, {
    description: 'Array of Documents model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Documents, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Documents) filter?: Filter<Documents>,
  ): Promise<Documents[]> {
    return this.documentsRepository.find(filter);
  }
   //! END CRUD POR DEFECTO DE LOOPBACK
}
