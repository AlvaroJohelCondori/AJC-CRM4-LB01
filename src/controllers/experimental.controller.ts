import { repository, Where } from '@loopback/repository';
import {get, param, response} from '@loopback/rest';
import {AccountsRepository} from '../repositories';
export class ExperimentalController {
  constructor(
    @repository(AccountsRepository)
    public accountsRepository: AccountsRepository,
  ) { }

  @get('/accounts-experimental')
  @response(200, {
    description: 'Get List Accounts HANSACRM4.0 ,[filter, order, sortBy, pagination]',
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
    @param.query.object('params',{
        type:'object',
        properties:{
            page:{
                type:'number'
            },
            rowsPerPage:{
                type:'number'
            },
            filter:{
                type:'string'
            },
            sortBy:{
                type:'string'
            },
            order:{
                type:'string'
            },
        }
    }) params:{
        page:number, 
        rowsPerPage:number,
        filter:string,
        sortBy:string,
        order:string,
    }
  ): Promise<object> {
     const { page, rowsPerPage, filter, sortBy, order } = params
     console.log(params);
     
    const sql = `EXEC [${process.env.SQL_DATABASE}].[crm4].[Accounts_Get_List] ${page},${rowsPerPage},'${filter}','${sortBy}','${order}'`;
    const data = await this.accountsRepository.execute(sql);
   
    return {
      data
    }
  }

  }
