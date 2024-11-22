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
import axios from 'axios';
import * as doc from '../docs';
import {modelListGenerator} from '../docs/DocListGenerator.model';
import * as list from '../docs/ExamplesListGenerator';
import {cleanSpecialCharacters, validarValor} from '../functions/cleanSpecialCharacters';
import {listGenerator} from '../functions/listGenerator';
import {methodManagement, methodManagementKeepingData} from '../functions/methodManagement';
import {createEmailPhones} from '../helpers/genericRequest';
import {Accounts} from '../models';
import {AccountsRepository} from '../repositories';
import * as querySQL from '../SQL';
import * as type from '../types';
import {ClassGlobalFunctions} from './GlobalFunctions';


export class AccountsController {
  constructor(
    @repository(AccountsRepository)
    public accountsRepository: AccountsRepository,
  ) { }

  // * DELETE MODULE WHIT LOGIN USER
  @del('/account-delete/{accountId}/{loginUser}')
  @response(204, {
    description: 'Account DELETE success',
  })
  async accountDeleteWhitUser(
    // obtiene parametros
    @param.path.string('accountId') accountId: string,
    @param.path.string('loginUser') loginUser: string,
    //END obtiene parametros
  ) {
    //envía JSON a BS
    //methodManagement: enviar method, url, data_send = NULL
    const responseRequest = await methodManagement('delete', `${process.env.URL_SUITECRM_CREATE}/module/Accounts/${accountId}/${loginUser}`) as {status: number; statusText: string; data: any;};
    if (!responseRequest) throw new HttpErrors.HttpError('indefinido en responseRequest (patch-module)');
    if (responseRequest.status && responseRequest.status != 200 && responseRequest.status != 201) return responseRequest;
    //END envía JSON a BS

    //respuesta para frontend
    const respMessaje =
      responseRequest.status !== 200
        ? 'row not updated in database'
        : 'Account DELETE success';
    const resp = {
      status: responseRequest.status,
      messaje: respMessaje,
    };
    // END respuesta para frontend
    return {
      resp,
    };
  }
  // * END DELETE MODULE WHIT LOGIN USER

  // * DELETE MODULE
  @del('/account-delete/{accountId}')
  @response(204, {
    description: 'Account DELETE success',
  })
  async accountDelete(
    // obtiene parametros
    @param.path.string('accountId') accountId: string,
    //END obtiene parametros
  ) {
    //envía JSON a BS
    //methodManagement: enviar method, url, data_send = NULL
    const responseRequest = await methodManagement('delete', `${process.env.URL_SUITECRM_CREATE}/module/Accounts/${accountId}`) as {status: number; statusText: string; data: any;};
    if (!responseRequest) throw new HttpErrors.HttpError('indefinido en responseRequest (patch-module)');
    if (responseRequest.status && responseRequest.status != 200 && responseRequest.status != 201) return responseRequest;
    //END envía JSON a BS

    //respuesta para frontend
    const respMessaje =
      responseRequest.status !== 200
        ? 'row not updated in database'
        : 'Account DELETE success';
    const resp = {
      status: responseRequest.status,
      messaje: respMessaje,
    };
    // END respuesta para frontend
    return {
      resp,
    };
  }
  // * END DELETE MODULE

  // * UPDATE DETAIL ACCOUNT
  @patch('/account-update/{account_id}')
  @response(200, {
    description: 'Account update',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          title: 'PingResponse',
        },
      },
    },
  })
  async accountUpdate(
    // obtiene parametros
    @param.path.string('account_id') account_id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              info_account: {
                type: 'object',
              },
              phone_email_account: {
                type: 'object',
              },
              assigned_users: {
                type: 'array',
              },
              comments: {
                type: 'object',
              },
              related_accounts: {
                type: 'array',
              },
            },
          },
        },
      },
    })
    body: type.Resp,
    //END obtiene parametros
  ) {
    try {
      //construye JSON
      const {info_account: {detail_account, direction_account}} = body;
      const attributes = Object.assign(detail_account, direction_account);
      const data_send = {
        data: {
          type: 'Accounts',
          id: account_id,
          attributes,
        },
      };
      //END construye JSON
      //methodManagement: enviar method, url, data_send = NULL
      const responseRequest = (await methodManagement(
        'patch',
        `${process.env.URL_SUITECRM_CREATE}/module`,
        data_send,
      )) as {status: number; statusText: string; data: any};
      if (!responseRequest)
        throw new HttpErrors.HttpError(
          'indefinido en responseRequest (patch-account)',
        );
      if (responseRequest.status && responseRequest.status !== 200 && responseRequest.status !== 201)
        return responseRequest;
      const {status, statusText, data: {type, id, attributes: attributes_resp}} = responseRequest;
      //END envía JSON a BS

      //respuesta para frontend
      const resp = {
        info_account: {
          detail_account: {
            id: id,
            account_type: attributes_resp.account_type,
            billing_address_city: attributes_resp.billing_address_city,
            billing_address_country: attributes_resp.billing_address_country,
            billing_address_state_list_c:
              attributes_resp.billing_address_state_list_c,
            industry: attributes_resp.industry,
            name: attributes_resp.name,
            nit_ci_c: attributes_resp.nit_ci_c,
            nombre_comercial_c: attributes_resp.nombre_comercial_c,
            regimen_tributario_c: attributes_resp.regimen_tributario_c,
            subindustry_c: attributes_resp.subindustry_c,
            tipo_documento_c: attributes_resp.tipo_documento_c,
            tipocuenta_c: attributes_resp.tipocuenta_c,
          },
          direction_account: {
            billing_address_street: attributes_resp.billing_address_street,
          },
        },
      };
      // END respuesta para frontend
      return {
        resp,
      };
    } catch (error) {
      console.log(error);
    }
  }
  // * END UPDATE DETAIL ACCOUNT

  @post('/account-new')
  @response(200, {
    description: 'New account creation',
    content: {
      'application/json': {
        schema: {
          type: 'json',
          title: 'PingResponse',
        },
      },
    },
  })
  async createAccount(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            //required: ['email', 'password'],
            properties: {
              info_account: {
                type: 'object',
              },
              phone_email_account: {
                type: 'object',
              },
              assigned_users: {
                type: 'array',
              },
              comments: {
                type: 'object',
              },
              related_accounts: {
                type: 'array',
              },
            },
          },
        },
      },
    })
    body: type.Resp,
  ) {
    try {
      // * REGISTRO DE INFORMACIÓN DE LA CUENTA
      const {
        info_account: {detail_account, direction_account},
        phone_email_account: {emails, phones},
        assigned_users,
        comments,
        related_accounts,
      } = body;
      const attributes = Object.assign(detail_account, direction_account);
      const data_send = {
        data: {
          type: 'Accounts',
          attributes,
        },
      };

      const result_account = await axios.post(
        `${process.env.URL_SUITECRM_CREATE}/module`,
        data_send,
        ClassGlobalFunctions.tokensutecrm,
      );
      const {type, id, attributes: attributes_resp} = result_account.data.data;

      if (emails.length <= 0) {
        const user_create_by = attributes_resp.created_by;

        const data_send = {
          data: {
            module: 'Accounts',
            id: id,
          },
        };
        // Discoment when the template and mail have been defined
        // const sned_email_when_account_not_email = await axios.post(`${process.env.URL_SUITECRM_CREATE}/send-email/` + user_create_by, data_send, ClassGlobalFunctions.tokensutecrm);
      }

      // * REGISTRO DE INFORMACIÓN DE EMAIL & TELEFONOS
      const idUser = attributes_resp.created_by;
      await createEmailPhones(
        id,
        idUser,
        phones,
        emails,
        'Accounts',
        ClassGlobalFunctions.tokensutecrm,
      );

      const sqlGetEmail = `EXEC [${process.env.SQL_DATABASE}].[crm4].[BeanId_get_Email] '${id}'`;
      const emailsRead = await this.accountsRepository.execute(sqlGetEmail);
      const sqlGetPhones = `EXEC [${process.env.SQL_DATABASE}].[crm4].[BeanId_get_phones] '${id}'`;
      const phonesRead = await this.accountsRepository.execute(sqlGetPhones);

      // * REGISTRO DE USUARIOS ASIGNADOS
      const data_send_assigned_users = {
        data: {
          module: `${type}s`,
          idmodule: id,
          relatedmodule: 'HANA_Relaciones',
          data_hanarelation: assigned_users,
        },
      };
      const result_users = await axios.post(
        `${process.env.URL_SUITECRM_CREATE}/HANA-Relaciones-create`,
        data_send_assigned_users,
        ClassGlobalFunctions.tokensutecrm,
      );
      // console.log(result_users.data);
      const {
        code: code_users,
        module,
        idmodule,
        relatedmodule,
        data_hanarelation,
      } = result_users.data;
      // * REGISTRO DE COMENTARIOS
      comments.idmodule = id;
      const data_send_comment = {
        data: comments,
      };
      const result_comment = await axios.post(
        `${process.env.URL_SUITECRM_CREATE}/create_comentario`,
        data_send_comment,
        ClassGlobalFunctions.tokensutecrm,
      );
      //console.log(result_comment.data);
      const {code: code_comment, comments: resp_comment} = result_comment.data;

      // * REGISTRO DE CUENTAS RELACIONADAS
      const data_send_accounts = {
        data: {
          module: `${type}s`,
          idmodule: id,
          data_accounts: related_accounts,
        },
      };
      const result_accounts = await axios.post(
        `${process.env.URL_SUITECRM_CREATE}/Account-Related-Accounts-create`,
        data_send_accounts,
        ClassGlobalFunctions.tokensutecrm,
      );
      //console.log(result_accounts.data);
      const {
        code: code_accounts,
        module: module_accounts,
        idmodule: idmodule_accounts,
        data_accounts,
      } = result_accounts.data;
      // * RESPUESTA FINAL AL FRONTEND
      const resp = {
        info_account: {
          detail_account: {
            id: id,
            account_type: attributes_resp.account_type,
            billing_address_city: attributes_resp.billing_address_city,
            billing_address_country: attributes_resp.billing_address_country,
            billing_address_state_list_c:
              attributes_resp.billing_address_state_list_c,
            industry: attributes_resp.industry,
            name: attributes_resp.name,
            names_c: validarValor(attributes_resp.names_c),
            lastname_c: validarValor(attributes_resp.lastname_c),
            nit_ci_c: attributes_resp.nit_ci_c,
            nombre_comercial_c: attributes_resp.nombre_comercial_c,
            regimen_tributario_c: attributes_resp.regimen_tributario_c,
            subindustry_c: attributes_resp.subindustry_c,
            tipo_documento_c: attributes_resp.tipo_documento_c,
            tipocuenta_c: attributes_resp.tipocuenta_c,
            idcuentasap_c: attributes_resp.idcuentasap_c,
          },
          direction_account: {
            billing_address_street: attributes_resp.billing_address_street,
            billing_address_state: attributes_resp.billing_address_state,
            shipping_address_street: attributes_resp.shipping_address_street,
            shipping_address_city: attributes_resp.shipping_address_city,
            shipping_address_state: attributes_resp.shipping_address_state,
            shipping_address_country: attributes_resp.shipping_address_country,
            address_street_generated_c:
              attributes_resp.address_street_generated_c,
            jjwg_maps_lat_c: attributes_resp.jjwg_maps_lat_c,
            jjwg_maps_lng_c: attributes_resp.jjwg_maps_lng_c,
            jjwg_maps_address_c: attributes_resp.jjwg_maps_address_c,
          },
        },
        phone_email_account: {
          emails: emailsRead,
          phones: phonesRead,
          celular_c: attributes_resp.celular_c,
          phone_office: attributes_resp.phone_office,
          phone_fax: attributes_resp.phone_fax,
          phone_office_wp_c: attributes_resp.phone_office_wp_c,
          phone_office_cd_c: attributes_resp.phone_office_cd_c,
          celular_wp_c: attributes_resp.celular_wp_c,
          celular_cd_c: attributes_resp.celular_cd_c,
        },
        assigned_users: data_hanarelation,
        comments: resp_comment,
        related_accounts: data_accounts,
      };
      return {
        resp,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /**
   * ? Get List Accounts with paginations, sortBy, Order, and Filter by [nombre, nit, codaio, tipocuenta, asignado_a]
   * @param params
   * @returns
   */
  @get('/accounts-list')
  @response(200, {
    description:
      'Get List Accounts HANSACRM ,[filter, order, sortBy, pagination]',
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
          type: 'number',
        },
        rowsPerPage: {
          type: 'number',
        },
        filter: {
          type: 'object',
        },
        sortBy: {
          type: 'string',
        },
        order: {
          type: 'string',
        },
      },
    })
    params: {
      page: number;
      rowsPerPage: number;
      filter: any;
      sortBy: string;
      order: string;
    },
  ): Promise<object> {
    const {page, rowsPerPage, filter, sortBy, order} = params;
    //JSON.parse(params?.filter);
    const {
      easyFilterd,
      name,
      lastname,
      comercial_name,
      client_type,
      account_type,
      aio_code,
      nit_ci,
      cellphone,
      email,
      industry,
      sub_industry,
      country,
      state,
      city,
      street,
      document_type,
      tax_regime,
      website,
      created_by,
      modified_by,
      assigned_to,
      creation_date = {from: '', to: ''},
    } = filter;

    console.log(params);

    const {from, to} = creation_date;

    const sql = `
                SELECT
                      a.id,
                      a.name as nombre,
                      ac.nit_ci_c as nit,
                      ac.idcuentasap_c as codigo,
                      a.phone_office as telefono,
                      ac.tipocuenta_c as tipo,
                      (us.first_name+' '+us.last_name) as creado_por,
                      (us2.first_name+' '+us2.last_name) as modificado_por,
                      (us1.first_name+' '+us1.last_name) as asignado_a,
                      CONVERT(varchar, a.date_modified,103) as fecha_modificacion,
                      CONVERT(varchar, a.date_entered,103) as fecha_creacion,
                      eaa.email_address as correo,
                      a.shipping_address_city as ciudad,
                      a.billing_address_state as departamento,
                      a.modified_user_id,
                      a.assigned_user_id
                FROM dbo.accounts a
                  left join dbo.accounts_cstm ac on ac.id_c =a.id
                  left join dbo.users us on us.id = a.created_by and us.deleted =0
                  left join dbo.users us1 on us1.id = a.assigned_user_id  and us1.deleted =0
                  left join dbo.users us2 on us2.id = a.modified_user_id  and us2.deleted =0
                  left join dbo.email_addr_bean_rel ea on ea.bean_id=a.id and ea.deleted=0 and ea.bean_module='Accounts' and ea.primary_address = '1'
                  left join dbo.email_addresses eaa on eaa.id=ea.email_address_id and eaa.deleted=0
                WHERE a.deleted = 0 AND a.name is not null
                ${name ? `AND a.name like '%${name}%'` : ''}
                ${lastname ? `AND a.name like '%${lastname}%'` : ''}
                ${comercial_name ? `AND ac.nombre_comercial_c like '%${comercial_name}%'` : ''}
                ${client_type ? `AND a.account_type = '${client_type}'` : ''}
                ${account_type ? `AND ac.tipocuenta_c = '${account_type}'` : ''}
                ${aio_code ? `AND ac.idcuentasap_c = '${aio_code}'` : ''}
                ${nit_ci ? `AND ac.nit_ci_c = '${nit_ci}'` : ''}
                ${cellphone ? `AND a.phone_office = '${cellphone}'` : ''}
                ${email ? `AND eaa.email_address like '%${email}%'` : ''}
                ${industry ? `AND a.industry = '${industry}'` : ''}
                ${sub_industry ? `AND ac.subindustry_c = '${sub_industry}'` : ''}
                ${country ? `AND a.billing_address_country = '${country}'` : ''}
                ${state ? `AND a.billing_address_state = '${state}'` : ''}
                ${city ? `AND a.billing_address_city like '%${city}%'` : ''}
                ${street ? `AND a.billing_address_street like '%${street}%'` : ''}
                ${document_type ? `AND ac.tipo_documento_c = '${document_type}'` : ''}
                ${tax_regime ? `AND ac.regimen_tributario_c = '${tax_regime}'` : ''}
                ${website ? `AND a.website = '${website}'` : ''}
                ${from && to ? `AND a.date_entered BETWEEN '${from}' AND '${to}'` : ''}
                ${created_by ? `AND a.created_by in ('${created_by.toString()}')` : ''}
                ${assigned_to ? `AND a.assigned_user_id in ('${assigned_to.toString()}')` : ''}
                ORDER BY a.date_entered DESC
                OFFSET ${(page - 1) * rowsPerPage} ROWS FETCH NEXT ${rowsPerPage} ROWS ONLY`;
    console.log(sql);
    // ${ name? `AND a.name like '%${name}%'`:''}
    // ${ lastname? `AND a.name like '%${lastname}%'`:''}
    // ${ comercial_name? `AND ac.nombre_comercial_c like '%${comercial_name}%'`:''}
    // ${ client_type? `AND a.account_type = '${client_type}'`:''}
    // ${ account_type? `AND ac.tipocuenta_c = '${account_type}'`:''}
    // ${ aio_code? `AND ac.idcuentasap_c = '${aio_code}'`:''}
    // ${ nit_ci? `AND ac.nit_ci_c = `+nit_ci :''}
    // ${ cellphone? `AND a.phone_office = '${cellphone}'`:''}
    // ${ email? `AND eaa.email_address like '%${email}%'`:''}
    // ${ industry? `AND a.industry = '${industry}'`:''}
    // ${ sub_industry? `AND ac.subindustry_c = '${sub_industry}'`:''}
    // ${ country? `AND a.billing_address_country = '${country}'`:''}
    // ${ state? `AND a.billing_address_state = '${state}'`:''}
    // ${ city? `AND a.billing_address_city like '%${city}%'`:''}
    // ${ street? `AND a.billing_address_street like '%${street}%'`:''}
    // ${ document_type? `AND ac.tipo_documento_c = '${document_type}'`:''}
    // ${ tax_regime? `AND ac.regimen_tributario_c = '${tax_regime}'`:''}
    // ${ website? `AND a.website = '${website}'`:''}
    // ${ from && to? `AND a.date_entered BETWEEN '${from}' AND '${to}'`:''  }
    // ${ created_by? `AND a.created_by in (SELECT slipt FROM dbo.[fn_Util_Slipt]( replace('${created_by}','[]',''), ',')`:''}
    // ${ assigned_to? `AND a.assigned_user_id in (SELECT slipt FROM dbo.[fn_Util_Slipt]( replace('${assigned_to}','[]',''), ',')`:''}

    const data = await this.accountsRepository.execute(sql);
    return {
      data,
    };
  }

  /**
   * ? Filtro avanzado de cuentas, recibe como parametros 24 entradas distintas para combinarlas en el SP
   * @param object
   * @returns array
   */
  @get('/accounts_advanced_filter')
  @response(200, {
    description:
      'Search users with coincidenses in 24 entry fields,[name, nombrecomercial_c, tipo_documento_c, client_type, ... ]',
    content: {
      'application/json': {
        schema: {
          type: 'json',
          title: 'PingResponse',
        },
      },
    },
  })
  async AdvancedFilter(
    @param.query.object('params', {
      type: 'object',
      properties: {
        page: {
          type: 'number',
        },
        rowsPerPage: {
          type: 'number',
        },
        filter: {
          type: 'object',
        },
        sortBy: {
          type: 'string',
        },
        order: {
          type: 'string',
        },
      },
    })
    params: {
      page: number;
      rowsPerPage: number;
      filter: any;
      sortBy: string;
      order: string;
    },
  ): Promise<object> {
    const {page, rowsPerPage, filter, sortBy, order} = params;
    //JSON.parse(params?.filter);
    const {
      easyFilter = '',
      name = '',
      lastname = '',
      comercial_name = '',
      client_type = '',
      account_type = '',
      aio_code = '',
      nit_ci = '',
      cellphone = '',
      email = '',
      industry = '',
      sub_industry = '',
      country = '',
      state = '',
      city = '',
      street = '',
      document_type = '',
      tax_regime = '',
      website = '',
      created_by = '',
      modified_by = '',
      assigned_to = '',
      creation_date = {
        option: '',
        from: '',
        to: '',
        operator: '',
      },
      campaign = []
    } = filter;

    const {option, from, to, operator} = creation_date;
    const sql = `EXEC [${process.env.SQL_DATABASE}].[crm4].[Accounts_Filter_Advanced] ${page},${rowsPerPage},'${sortBy}','${order}','${cleanSpecialCharacters(
      easyFilter,
    )}',
                                                                  '${cleanSpecialCharacters(
      name,
    )}','${cleanSpecialCharacters(
      lastname,
    )}','${cleanSpecialCharacters(
      comercial_name,
    )}','${client_type}','${account_type}',
                                                                  '${cleanSpecialCharacters(
      aio_code,
    )}','${cleanSpecialCharacters(
      nit_ci,
    )}','${cleanSpecialCharacters(cellphone)}','${cleanSpecialCharacters(
      email,
    )}','${industry}',
                                                                  '${sub_industry}','${country}','${state}','${cleanSpecialCharacters(
      city,
    )}','${cleanSpecialCharacters(street)}',
                                                                  '${document_type}','${tax_regime}','${website}','${created_by}','${modified_by}',
                                                                  '${assigned_to}','${from}','${to}','${operator}', '${campaign.toString()}'`;

    const data = await this.accountsRepository.execute(sql);

    return {
      data,
    };
  }
  // * GET MODULE
  @post('/filter_advance_accounts_listGeneric/{table_name}')
  @response(200, {
    description: 'Get module',
  })
  async filter_advance_accounts_listGeneric(
    @param.path.string('table_name') table_name: string,
    @requestBody({
      description: 'New module',
      content: {
        'aplication/json': {
          schema: getModelSchemaRef(modelListGenerator, {
            partial: true
          }),
          example: list.jsonExampleList1(),
        },
        'aplication2/json': {
          schema: getModelSchemaRef(modelListGenerator, {
            partial: true
          }),
          example: list.jsonExampleList2(),
        },
        'aplication3/json': {
          schema: getModelSchemaRef(modelListGenerator, {
            partial: true
          }),
          example: list.jsonExampleList2(),
        },
      },
    })
    params: any
  ) {
    try {
      //////////////// CONDICIONAL PARA JOIN //////////////////
      const {columnsFilter} = params

      let condicional = ``;
      for (let i = 0; i < columnsFilter.length; i++) {
        if (columnsFilter[i].valueFilterAdvance == 'email_address') {
          condicional = columnsFilter[i].valueFilterAdvance == `` ? `and ea.primary_address = 1` : ``;
        }
      }

      const join = `LEFT JOIN email_addr_bean_rel WITH (NOLOCK) ON email_addr_bean_rel.bean_id=${table_name}.id and email_addr_bean_rel.deleted = 0
        LEFT JOIN email_addresses WITH (NOLOCK) ON email_addresses.id=email_addr_bean_rel.email_address_id and email_addresses.deleted = 0 ${condicional}
        LEFT JOIN pho_phone_addr_bean_rel pho_phone_addr_bean_rel WITH (NOLOCK) ON pho_phone_addr_bean_rel.bean_id=${table_name}.id and pho_phone_addr_bean_rel.deleted = 0
				LEFT JOIN pho_phones pho_phones WITH (NOLOCK) ON pho_phones.id=pho_phone_addr_bean_rel.phone_id and pho_phones.deleted=0
        `;
      //////////////// END CONDICIONAL PARA JOIN //////////////////

      const query = await listGenerator(table_name, join, params);
      if (!query) return 'error, al retornar de la función list Generator';

      console.log(`EXEC [${process.env.SQL_DATABASE}].[crm4].[Execute_Query] '${query}'`);

      const data = await this.accountsRepository.execute(`EXEC [${process.env.SQL_DATABASE}].[crm4].[Execute_Query] '${query}'`);
      if (!data) return 'error al devolver la consulta';
      return data;

    } catch (error) {
      console.log(error);
      return error;
    }
  }
  // * END GET MODULE

  // * GET total Accounts in one number
  @get('/accounts-total')
  @response(200, {
    description: 'Get total Accounts HANSACRM',
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
          type: 'object',
        },
      },
    })
    params: {
      filter: any;
    },
  ): Promise<object> {
    const {filter} = params;
    const {
      easyFilter = '',
      name = '',
      lastname = '',
      comercial_name = '',
      client_type = '',
      account_type = '',
      aio_code = '',
      nit_ci = '',
      cellphone = '',
      email = '',
      industry = '',
      sub_industry = '',
      country = '',
      state = '',
      city = '',
      street = '',
      document_type = '',
      tax_regime = '',
      website = '',
      created_by = '',
      modified_by = '',
      assigned_to = '',
      creation_date = {from: '', to: '', operator: ''},
      campaign = []
    } = filter;
    console.log(params);
    const {from, to, operator} = creation_date;

    const sql = `EXEC [${process.env.SQL_DATABASE}].[crm4].[Accounts_Get_Total] '${easyFilter}','${name}','${lastname}','${comercial_name}','${client_type}',
                                                            '${account_type}','${aio_code}','${nit_ci}','${cellphone}','${email}',
                                                            '${industry}','${sub_industry}','${country}','${state}','${city}',
                                                            '${street}','${document_type}','${tax_regime}','${website}','${created_by}',
                                                            '${modified_by}','${assigned_to}','${from}','${to}','${operator}', '${campaign.toString()}'`;
    console.log(sql);
    const data = await this.accountsRepository.execute(sql);
    return data[0].total;
  }
  // * END

  //--------------------
  // * GET service to bring the information of an account
  @get('/accounts-getAccount/{id}')
  @response(200, {
    description: 'Get Account HANSACRM',
    content: {
      'application/json': {
        schema: {
          type: 'json',
          title: 'PingResponse',
        },
      },
    },
  })
  async getaccount(@param.path.string('id') id: string): Promise<object> {
    const sql = `EXEC [${process.env.SQL_DATABASE}].[crm4].[Accounts_Get_ToSeeAccount] '${id}'`;
    const data = await this.accountsRepository.execute(sql);
    return {
      data,
    };
  }
  // * END

  /**
   * ? Filter account by nombre, aio, nit
   */
  @get('/accounts/search')
  @response(200, {
    description: 'Get Account filter HANSACRM',
    content: {
      'application/json': {
        schema: {
          type: 'json',
          title: 'PingResponse',
        },
      },
    },
  })
  async searchAccounts(
    @param.query.object('params', {
      type: 'object',
      properties: {
        filter: {
          type: 'string',
        },
      },
    })
    params: {
      filter: string;
    },
  ): Promise<object> {
    const {filter} = params;
    const sql = `EXEC [${process.env.SQL_DATABASE}].[crm4].[Account_Search_By_Name_Aio_Nit] '${filter}'`;
    const data = await this.accountsRepository.execute(sql);
    return {
      data,
    };
  }

  @post('/Accounts')
  @response(200, {
    description: 'Accounts model instance',
    content: {'application/json': {schema: getModelSchemaRef(Accounts)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Accounts, {
            title: 'NewAccounts',
            //exclude: ['id'],
          }),
        },
      },
    })
    accounts: Omit<Accounts, 'id'>,
  ): Promise<Accounts> {
    return this.accountsRepository.create(accounts);
  }

  @get('/accounts/count')
  @response(200, {
    description: 'Accounts model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Accounts) where?: Where<Accounts>): Promise<Count> {
    return this.accountsRepository.count(where);
  }

  @get('/accounts')
  @response(200, {
    description: 'Array of Accounts model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Accounts, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Accounts) filter?: Filter<Accounts>,
  ): Promise<Accounts[]> {
    return this.accountsRepository.find(filter);
  }

  @patch('/accounts')
  @response(200, {
    description: 'Accounts PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Accounts, {partial: true}),
        },
      },
    })
    accounts: Accounts,
    @param.where(Accounts) where?: Where<Accounts>,
  ): Promise<Count> {
    return this.accountsRepository.updateAll(accounts, where);
  }

  @get('/accounts/{id}')
  @response(200, {
    description: 'Accounts model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Accounts, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Accounts, {exclude: 'where'})
    filter?: FilterExcludingWhere<Accounts>,
  ): Promise<Accounts> {
    return this.accountsRepository.findById(id, filter);
  }

  @patch('/accounts/{id}')
  @response(204, {
    description: 'Accounts PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Accounts, {partial: true}),
        },
      },
    })
    Accounts: Accounts,
  ): Promise<void> {
    await this.accountsRepository.updateById(id, Accounts);
  }

  @put('/Accounts/{id}')
  @response(204, {
    description: 'Accounts PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() Accounts: Accounts,
  ): Promise<void> {
    await this.accountsRepository.replaceById(id, Accounts);
  }

  @del('/Accounts/{id}')
  @response(204, {
    description: 'Accounts DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.accountsRepository.deleteById(id);
  }

  //--------------------
  // * GET service to bring the information of history of changes
  @get('/accounts-getHistoryChanges/{id}')
  @response(200, {
    description: 'Get Account HANSACRM',
    content: {
      'application/json': {
        schema: {
          type: 'json',
          title: 'PingResponse',
        },
      },
    },
  })
  async gethistorychanges(
    @param.path.string('id') id: string,
  ): Promise<object> {
    const sql = `EXEC [${process.env.SQL_DATABASE}].[crm4].[Accounts_Get_History_Changes] '${id}'`;
    const data = await this.accountsRepository.execute(sql);
    return {
      data,
    };
  }
  // * END

  //--------------------
  // * GET service to bring the information of comments to the database
  @get('/accounts-getComments/{id}')
  @response(200, {
    description: 'Get Account HANSACRM',
    content: {
      'application/json': {
        schema: {
          type: 'json',
          title: 'PingResponse',
        },
      },
    },
  })
  async getcomments(@param.path.string('id') id: string): Promise<object> {
    const sql = `EXEC [${process.env.SQL_DATABASE}].[crm4].[Accounts_Get_Comments] '${id}'`;
    const data = await this.accountsRepository.execute(sql);
    return {
      data,
    };
  }
  // * END

  // CREATE TO COMMENTS
  @post('/account-newComment')
  @response(200, {
    description: 'New comments creation',
    content: {
      'application/json': {
        schema: {
          type: 'json',
          title: 'PingResponse',
        },
      },
    },
  })
  async createComment(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            //required: ['email', 'password'],
            properties: {
              comments: {
                type: 'object',
              },
            },
          },
        },
      },
    })
    body: type.RespComments
  ) {
    try {
      // * REGISTRO DE DEL COMENTARIO EN LA CUENTA
      const {comments} = body;
      console.log(body);
      const data_send_comment = {
        data: comments,
      };
      const result_comment = await axios.post(
        `${process.env.URL_SUITECRM_CREATE}/create_comentario`,
        data_send_comment,
        ClassGlobalFunctions.tokensutecrm,
      );
      //console.log(result_comment.data);
      const {code: code_comment, comments: resp_comment} = result_comment.data;
      // * RESPUESTA FINAL AL FRONTEND
      const resp = {
        comments: resp_comment,
      };
      return {
        resp,
      };
    } catch (error) {
      console.log(error);
    }
  }

  // UPDATE TO COMMENTS
  @post('/account-UpdateComment')
  @response(200, {
    description: 'Update comments',
    content: {
      'application/json': {
        schema: {
          type: 'json',
          title: 'PingResponse',
        },
      },
    },
  })
  async UpdateComment(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            //required: ['email', 'password'],
            properties: {
              comments: {
                type: 'object',
              },
            },
          },
        },
      },
    })
    body: type.RespComments,
  ) {
    try {
      // * REGISTRO DE DEL COMENTARIO EN LA CUENTA
      const {comments} = body;
      const data_send_comment = {
        data: comments,
      };
      const result_comment = await axios.post(
        `${process.env.URL_SUITECRM_CREATE}/update_comentario`,
        data_send_comment,
        ClassGlobalFunctions.tokensutecrm,
      );
      //console.log(result_comment.data);
      const {code: code_comment, comments: resp_comment} = result_comment.data;
      // * RESPUESTA FINAL AL FRONTEND
      const resp = {
        comments: resp_comment,
      };
      return {
        resp,
      };
    } catch (error) {
      console.log(error);
    }
  }

  // DELETE TO COMMENTS
  @post('/account-DeleteComment')
  @response(200, {
    description: 'Delete comments',
    content: {
      'application/json': {
        schema: {
          type: 'json',
          title: 'PingResponse',
        },
      },
    },
  })
  async DeleteComment(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            //required: ['email', 'password'],
            properties: {
              comments: {
                type: 'object',
              },
            },
          },
        },
      },
    })
    body: type.RespCommentsDelete,
  ) {
    try {
      // * REGISTRO DE DEL COMENTARIO EN LA CUENTA
      const {comments} = body;
      console.log(body);
      const data_send_comment = {
        data: comments,
      };

      //const resultAccount = await axios.delete(`${process.env.URL_SUITECRM_CREATE}/module/` + accountName + `/` + accountId, ClassGlobalFunctions.tokensutecrm);

      const result_comment = await axios.post(
        `${process.env.URL_SUITECRM_CREATE}/delete_comentario`,
        data_send_comment,
        ClassGlobalFunctions.tokensutecrm,
      );
      //console.log(result_comment.data);
      const {code: code_comment, comments: resp_comment} = result_comment.data;
      // * RESPUESTA FINAL AL FRONTEND
      const resp = {
        comments: resp_comment,
      };
      return {
        resp,
      };
    } catch (error) {
      console.log(error);
    }
  }
  //END DELETE COMMENT

  // * GET service to bring the information of assigned accounts on accounts
  @get('/accounts_assigned_users')
  @response(200, {
    description: 'Get Account Assgined to Account by Id HANSACRM',
    content: {
      'application/json': {
        schema: {
          type: 'json',
          title: 'PingResponse',
        },
      },
    },
  })
  async getAssignedUsers(
    @param.query.object('params', {
      type: 'object',
      properties: {
        iddivision: {
          type: 'string',
        },
        idaccount: {
          type: 'string',
        },
      },
    })
    params: {
      iddivision: string;
      idaccount: string;
    },
  ): Promise<object> {
    const {iddivision, idaccount} = params;
    const sql = `EXEC [${process.env.SQL_DATABASE}].[crm4].[Users_Assigned_By_Bean] accounts,'${iddivision}','${idaccount}'`;
    const data = await this.accountsRepository.execute(sql);
    return {
      data,
    };
  }
  // * END
  // * GET service to bring the information of assigned accounts on accounts
  @get('/accounts_assigned_single_user/{id}')
  @response(200, {
    description: 'Get Account Assgined to Account by Id HANSACRM',
    content: {
      'application/json': {
        schema: {
          type: 'json',
          title: 'PingResponse',
        },
      },
    },
  })
  async getAssignedUser(@param.path.string('id') id: string): Promise<object> {
    const sql = `EXEC [${process.env.SQL_DATABASE}].[crm4].[User_Assigned_By_Bean] accounts, '${id}'`;
    const data = await this.accountsRepository.execute(sql);
    return {
      data,
    };
  }
  // * END

  // * GET service to bring the information of comments to the database
  @get('/accounts_related/{id}')
  @response(200, {
    description: 'Get Account Related by Id',
    content: {
      'application/json': {
        schema: {
          type: 'json',
          title: 'PingResponse',
        },
      },
    },
  })
  async getRelatedAccounts(
    @param.path.string('id') id: string,
  ): Promise<object> {
    const sql = `EXEC [${process.env.SQL_DATABASE}].[crm4].[Accounts_Relations] '${id}'`;
    const data = await this.accountsRepository.execute(sql);
    return {
      data,
    };
  }
  // * END
  // DELETE ACCOUNTS RELATED ACCOUNTS
  @post('/accounts-relation_account-delete')
  @response(200, {
    description: 'Delete accounts related account',
    content: {
      'application/json': {
        schema: {
          type: 'json',
          title: 'PingResponse',
        },
      },
    },
  })
  async deleteAccountsrelateaccount(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              related_accounts: {
                type: 'array',
              },
            },
          },
        },
      },
    })
    body: type.RespMiembroDelete,
  ) {
    try {
      // * DELETE ACCOUNTS RELATED ACCOUNT
      const {related_accounts} = body;
      const data_send_accounts_related_account = {
        data: body,
      };
      const result_accounts_related_account = await axios.post(
        `${process.env.URL_SUITECRM_CREATE}/Account-Related-Accounts-delete`,
        data_send_accounts_related_account,
        ClassGlobalFunctions.tokensutecrm,
      );
      const {
        code: code_accounts_related_account,
        message: resp_accounts_related_account,
      } = result_accounts_related_account.data;
      // * RESPUESTA FINAL AL FRONTEND
      const resp = {
        code: code_accounts_related_account,
        related_accounts: resp_accounts_related_account,
      };
      return {
        resp,
      };
    } catch (error) {
      console.log(error);
    }
  }
  //END

  // CREATE ACCOUNTS RELATED ACCOUNTS
  @post('/accounts-relation_account-create')
  @response(200, {
    description: 'New accounts relatd accounts',
    content: {
      'application/json': {
        schema: {
          type: 'json',
          title: 'PingResponse',
        },
      },
    },
  })
  async createAccountsrelateaccount(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              related_accounts: {
                type: 'array',
              },
            },
          },
        },
      },
    })
    body: type.RespCreateMiembro,
  ) {
    try {
      // * REGISTER ACCOUNTS RELATED ACCOUNT
      const {related_accounts} = body;

      const data_send_accounts_related_account = {
        data: body,
      };
      const result_accounts_related_account = await axios.post(
        `${process.env.URL_SUITECRM_CREATE}/Account-Related-Accounts-create`,
        data_send_accounts_related_account,
        ClassGlobalFunctions.tokensutecrm,
      );
      const {
        code: code_accounts,
        module: module_accounts,
        idmodule: idmodule_accounts,
        id_user: id_user_accounts,
        data_accounts,
      } = result_accounts_related_account.data;

      // * RESPUESTA FINAL AL FRONTEND
      const resp = {
        code: code_accounts,
        module: module_accounts,
        idmodule: idmodule_accounts,
        id_user: id_user_accounts,
        related_accounts: data_accounts,
      };
      return {
        resp,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  // END
  // CREATE HANRA RELATED ACCOUNTS
  @post('/hana-relations-account-create')
  @response(200, {
    description: 'New hana relation with account',
    content: {
      'application/json': {
        schema: {
          type: 'json',
          title: 'PingResponse',
        },
      },
    },
  })
  async createHanaRelationAccount(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              assigned_users: {
                type: 'array',
              },
            },
          },
        },
      },
    })
    body: any,
  ) {
    try {
      // * REGISTER HANA RELATION ACCOUNT
      const {assigned_users} = body;

      const data_send_hana_realtion_accounts = {
        data: body,
      };
      const result_hana_realtion_account = await axios.post(
        `${process.env.URL_SUITECRM_CREATE}/HANA-Relaciones-create`,
        data_send_hana_realtion_accounts,
        ClassGlobalFunctions.tokensutecrm,
      );
      const {
        code: code_users,
        module,
        idmodule,
        id_user,
        relatedmodule,
        data_hanarelation,
        Error: error_response,
      } = result_hana_realtion_account.data;
      if (code_users == 200) {
        // * RESPUESTA FINAL AL FRONTEND
        const resp = {
          code: code_users,
          module: module,
          idmodule: idmodule,
          id_user: id_user,
          relatedmodule: relatedmodule,
          data_hanarelation: data_hanarelation,
        };
        return {
          resp,
        };
      } else {
        // * RESPUESTA FINAL AL FRONTEND
        const resp = {
          code: code_users,
          error: error_response,
        };
        return {
          resp,
        };
      }
    } catch (error) {
      console.log(error);
    }
  }
  // END

  //* GET ALL ACCOUNT INFORMATION
  @get('/account-get-all/{id_account}')
  @response(200, {
    description: 'Información de la cuenta por ID (12345678910).',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          title: 'PingResponse',
        },
      },
    },
  })
  async accountGetAll(
    // obtiene parametros
    @param.path.string('id_account') id_account: string,
    //END obtiene parametros
  ) {
    try {
      // obtiene token
      const responseRequest = (await methodManagement(
        'get',
        `${process.env.URL_SUITECRM_CREATE}/module/Accounts/${id_account}`,
      )) as {status: number; statusText: string; data: any};
      if (!responseRequest)
        throw new HttpErrors.HttpError(
          'indefinido en responseRequest (get-accounts)',
        );
      const {
        status,
        statusText,
        data: {type, id, attributes: attributes_resp},
      } = responseRequest;

      //obtiene data de Email
      const sql_get_email = `EXEC [${process.env.SQL_DATABASE}].[crm4].[Bean_get_Emails] accounts,'${id_account}'`;
      const emails_r = await this.accountsRepository.execute(sql_get_email);
      if (!emails_r)
        throw new HttpErrors.HttpError('indefinido en emails_r (get-contacts)');
      //obtiene data de Phones
      const sql_get_phone = `EXEC [${process.env.SQL_DATABASE}].[crm4].[Bean_get_Phones] accounts,'${id_account}'`;
      const phones_r = await this.accountsRepository.execute(sql_get_phone);
      if (!phones_r)
        throw new HttpErrors.HttpError('indefinido en phones_r (get-contacts)');
      //obtiene data de Comments
      const sql_get_comments = `EXEC [${process.env.SQL_DATABASE}].[crm4].[Bean_get_Comments] '${id_account}'`;
      const comments_r = await this.accountsRepository.execute(
        sql_get_comments,
      );
      if (!comments_r)
        throw new HttpErrors.HttpError(
          'indefinido en comments_r (get-contacts)',
        );

      const resp = {
        info_account: {
          detail_account: {
            id,
            assigned_user_id: attributes_resp.assigned_user_id,
            account_type: attributes_resp.account_type,
            billing_address_city: attributes_resp.billing_address_city,
            billing_address_country: attributes_resp.billing_address_country,
            billing_address_state_list_c:
              attributes_resp.billing_address_state_list_c,
            industry: attributes_resp.industry,
            name: attributes_resp.name,
            names_c: validarValor(attributes_resp.names_c),
            lastname_c: validarValor(attributes_resp.lastname_c),
            nit_ci_c: attributes_resp.nit_ci_c,
            nombre_comercial_c: attributes_resp.nombre_comercial_c,
            regimen_tributario_c: attributes_resp.regimen_tributario_c,
            subindustry_c: attributes_resp.subindustry_c,
            tipo_documento_c: attributes_resp.tipo_documento_c,
            tipocuenta_c: attributes_resp.tipocuenta_c,
            idcuentasap_c: attributes_resp.idcuentasap_c,
            created_by_name: attributes_resp.created_by_name,
            modified_by_name: attributes_resp.modified_by_name,
            //date_entered: attributes_resp.date_entered,
            date_modified: attributes_resp.date_modified,
            description: attributes_resp.description,
          },
          direction_account: {
            billing_address_street: attributes_resp.billing_address_street,
            shipping_address_street: attributes_resp.shipping_address_street,
            shipping_address_city: attributes_resp.shipping_address_city,
            shipping_address_state: attributes_resp.shipping_address_state,
            shipping_address_country: attributes_resp.shipping_address_country,
            address_street_generated_c:
              attributes_resp.address_street_generated_c,
            jjwg_maps_lat_c: attributes_resp.jjwg_maps_lat_c,
            jjwg_maps_lng_c: attributes_resp.jjwg_maps_lng_c,
            jjwg_maps_address_c: attributes_resp.jjwg_maps_address_c,
          },
        },
        phone_email_account: {
          emails: emails_r,
          phones: phones_r,
          celular_c: attributes_resp.celular_c,
          phone_office: attributes_resp.phone_office,
          phone_fax: attributes_resp.phone_fax,
          phone_office_wp_c: attributes_resp.phone_office_wp_c,
          phone_office_cd_c: attributes_resp.phone_office_cd_c,
          celular_wp_c: attributes_resp.celular_wp_c,
          celular_cd_c: attributes_resp.celular_cd_c,
        },
        comments: comments_r,
      };
      return {
        resp,
      };
    } catch (error) {
      console.log(error.message);
    }
  }

  // DELETE HANRA RELATED ACCOUNTS
  @patch('/hana-relations-account-delete')
  @response(200, {
    description: 'Delete hana relation by account',
    content: {
      'application/json': {
        schema: {
          type: 'json',
          title: 'PingResponse',
        },
      },
    },
  })
  async deleteHanaRelationAccount(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              assigned_users: {
                type: 'array',
              },
            },
          },
        },
      },
    })
    body: any,
  ) {
    try {
      // * REGISTER HANA RELATION ACCOUNT
      const {assigned_users} = body;

      const data_send_hana_realtion_accounts = {
        data: body,
      };
      // console.log(JSON.stringify(data_send_hana_realtion_accounts));
      const result_hana_realtion_account = await axios.post(
        `${process.env.URL_SUITECRM_CREATE}/HANA-Relaciones-delete`,
        data_send_hana_realtion_accounts,
        ClassGlobalFunctions.tokensutecrm,
      );
      const {
        code: code_users,
        module,
        idmodule,
        id_user,
        relatedmodule,
        data_hanarelation,
        Error: error_response,
      } = result_hana_realtion_account.data;
      if (code_users == 200) {
        // * RESPUESTA FINAL AL FRONTEND
        const resp = {
          code: code_users,
          module: module,
          idmodule: idmodule,
          id_user: id_user,
          relatedmodule: relatedmodule,
          data_hanarelation: data_hanarelation,
        };
        return {
          resp,
        };
      } else {
        // * RESPUESTA FINAL AL FRONTEND
        const resp = {
          code: code_users,
          error: error_response,
        };
        return {
          resp,
        };
      }
    } catch (error) {
      console.log(error);
    }
  }
  // END

  // CREATE EMAIL PHONE BY MODULE ACCOUNT
  @post('/email-phone-create')
  @response(200, {
    description: 'New create email and phone',
    content: {
      'application/json': {
        schema: {
          type: 'json',
          title: 'PingResponse',
        },
      },
    },
  })
  async emailphonecreate(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              phone_email_account: {
                type: 'object',
              },
            },
          },
        },
      },
    })
    body: type.phone_email,
  ) {
    try {
      // * REGISTER HANA RELATION ACCOUNT
      const data_send_phone_email_create = {
        data: body,
      };
      const result_phone_email = await axios.post(
        // The endpoint was created as 'emails-phone-crete' ask to fix that typo later
        `${process.env.URL_SUITECRM_CREATE}/emails-phone-create`,
        data_send_phone_email_create,
        ClassGlobalFunctions.tokensutecrm,
      );
      const {code: code_users, phones, emails} = result_phone_email.data;
      const response_emails = {};
      // * RESPUESTA FINAL AL FRONTEND
      const resp = {
        code: code_users,
        emails: emails,
        phones: phones,
      };
      return {
        resp,
      };
    } catch (error) {
      console.log(error);
    }
  }
  // END

  // //* Create Phones and Emails of an Account by Id.
  @post('/create-phones-emails-by-account/{id_account}')
  @response(200, {
    description: 'Create Phones and Email of an Account by Id',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          title: 'Response',
        },
      },
    },
  })
  async createPhonesAndEmailsByAccount(
    @param.path.string('id_account') idAccount: string,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              body: {
                type: 'object',
              },
            },
          },
        },
      },
    })
    body: any,
  ) {
    try {
      const {
        idUser,
        phones = [],
        emails = [],
      } = body;

      const suiteBody = {
        data: {
          module: 'Accounts',
          idModule: idAccount,
          idUser: idUser,
          relatemodule: [
            {
              nameModule: 'EmailAddress',
              items: emails || [],
            },
            {
              nameModule: 'pho_phones',
              items: phones || [],
            },
          ],
        },
      };

      const responseRequest = await axios.post(
        // The endpoint was created as 'emails-phone-crete' ask to fix that typo later
        `${process.env.URL_SUITECRM_CREATE}/emails-phone-create`,
        suiteBody,
        ClassGlobalFunctions.tokensutecrm,
      );

      if (responseRequest.status !== 200 && responseRequest.status !== 201) {
        throw new HttpErrors.HttpError(responseRequest.statusText);
      }

      return responseRequest.data;
    } catch (error) {
      if (!!error.response?.status && error.response.status === 400) {
        throw new HttpErrors.BadRequest(error.message);
      }
      throw new HttpErrors.HttpError(error.message);
    }
  }

  //* Read phones and Emails of an Account by Id.
  @get('/get-phones-emails-account/{idAccount}')
  @response(200, {
    description: 'Get Phones and Emails of Account by Id',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          title: 'Response',
        },
      },
    },
  })
  async accountGetPhonesEmails(
    @param.path.string('idAccount') idAccount: string,
  ) {
    try {
      const sql_get_email = `EXEC [${process.env.SQL_DATABASE}].[crm4].[BeanId_get_Email] '${idAccount}'`;
      const emails_r = await this.accountsRepository.execute(sql_get_email);
      const sql_get_phone = `EXEC [${process.env.SQL_DATABASE}].[crm4].[BeanId_get_phones] '${idAccount}'`;
      const phones_r = await this.accountsRepository.execute(sql_get_phone);

      return {
        emails: emails_r,
        phones: phones_r,
      };
    } catch (error) {
      console.log(error.message);
    }
  }

  // UPDATE EMAIL PHONE BY MODULE ACCOUNT
  @patch('/email-phone-update')
  @response(200, {
    description: 'Update email and phones',
    content: {
      'application/json': {
        schema: {
          type: 'json',
          title: 'PingResponse',
        },
      },
    },
  })
  async emailphoneupdate(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              phone_email_account: {
                type: 'object',
              },
            },
          },
        },
      },
    })
    body: type.phone_email_update,
  ) {
    try {
      // * REGISTER HANA RELATION ACCOUNT
      const data_send_phone_email_update = {
        data: body,
      };

      const result_phone_email = await axios.patch(
        `${process.env.URL_SUITECRM_CREATE}/emails-phone-update`,
        data_send_phone_email_update,
        ClassGlobalFunctions.tokensutecrm,
      );
      const {code: code_users, phones, emails} = result_phone_email.data;

      // * RESPUESTA FINAL AL FRONTEND
      const resp = {
        code: code_users,
        emails: emails,
        phones: phones,
      };
      return {
        resp,
      };
    } catch (error) {
      console.log(error);
    }
  }
  // END

  //* Update Phones and Emails by Account Id
  @patch('/email-phone-update-account/{id_account}')
  @response(200, {
    description: 'Update Phones and Email of Account by Id',
    content: {
      'application/json': {schema: {type: 'object', title: 'Response'}},
    },
  })
  async emailPhoneUpdateById(
    @param.path.string('id_account') idAccount: string,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              body: {
                type: 'object',
              },
            },
          },
        },
      },
    })
    body: any,
  ) {
    const {
      idUser,
      //emails = [] as model.EmailsModel[],
      //phones = [] as model.PhonesModel[],
      emails = [] as any[],
      phones = [] as any[],
    } = body;

    const suiteBody = {
      data: {
        module: 'Accounts',
        idModule: idAccount,
        idUser: idUser,
        relatemodule: [
          {
            nameModule: 'EmailAddress',
            items: emails || [],
          },
          {
            nameModule: 'pho_phones',
            items: phones || [],
          },
        ],
      },
    };

    try {
      const responseRequest = await axios.patch(
        `${process.env.URL_SUITECRM_CREATE}/emails-phone-update`,
        suiteBody,
        ClassGlobalFunctions.tokensutecrm,
      );
      if (responseRequest.status !== 200) {
        throw new HttpErrors.HttpError(responseRequest.statusText);
      }
      return responseRequest.data;
    } catch (error) {
      if (!!error.response?.status && error.response.status === 400) {
        throw new HttpErrors.BadRequest(error.message);
      }
      throw new HttpErrors.HttpError(error.message);
    }
  }

  // DELETE EMAIL PHONE BY MODULE ACCOUNT
  @post('/email-phone-delete')
  @response(200, {
    description: 'Delete email and phone',
    content: {
      'application/json': {
        schema: {
          type: 'json',
          title: 'PingResponse',
        },
      },
    },
  })
  async emailphonedelete(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              phone_email_account: {
                type: 'object',
              },
            },
          },
        },
      },
    })
    body: any,
  ) {
    try {
      // * REGISTER HANA RELATION ACCOUNT
      const data_send_phone_email_delete = {
        data: body,
      };

      const result_phone_email = await axios.patch(
        `${process.env.URL_SUITECRM_CREATE}/emails-phone-delete`,
        data_send_phone_email_delete,
        ClassGlobalFunctions.tokensutecrm,
      );
      const {code: code_users, phones, emails} = result_phone_email.data;

      // * RESPUESTA FINAL AL FRONTEND
      const resp = {
        code: code_users,
        emails: emails,
        phones: phones,
      };
      return {
        resp,
      };
    } catch (error) {
      console.log(error);
    }
  }
  // END

  @patch('/email-phone-delete-account/{id_account}')
  @response(200, {
    description: 'Delete Phones and Email of Account by Id',
    content: {
      'application/json': {schema: {type: 'object', title: 'Response'}},
    },
  })
  async emailPhoneDeleteById(
    @param.path.string('id_account') idAccount: string,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              body: {
                type: 'object',
              },
            },
          },
        },
      },
    })
    body: any,
  ) {
    const {
      idUser,
      phones = [] as any[],
      emails = [] as any[],
    } = body;

    const suiteBody = {
      data: {
        module: 'Accounts',
        idModule: idAccount,
        idUser: idUser,
        relatemodule: [
          {
            nameModule: 'EmailAddress',
            items: emails || [],
          },
          {
            nameModule: 'pho_phones',
            items: phones || [],
          },
        ],
      },
    };

    try {
      const responseRequest = await axios.patch(
        `${process.env.URL_SUITECRM_CREATE}/emails-phone-delete`,
        suiteBody,
        ClassGlobalFunctions.tokensutecrm,
      );
      if (responseRequest.status !== 200) {
        throw new HttpErrors.HttpError(responseRequest.statusText);
      }
      return responseRequest.data;
    } catch (error) {
      if (!!error.response?.status && error.response.status === 400) {
        throw new HttpErrors.BadRequest(error.message);
      }
      throw new HttpErrors.HttpError(error.message);
    }
  }

  //* GET ALL ACCOUNTS WITH CI/NIT EQUALS TO SEARCHED
  @get('/account-verify-ci_nit/{module}/{search}')
  @response(200, {
    description: 'Get information of account by id',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          title: 'PingResponse',
        },
      },
    },
  })
  async verifyEmailsPhones(
    @param.path.string('module') module: string,
    @param.path.string('search') search: string,
  ) {
    try {
      const sql = `[crm4].[Accounts_Verify_Ci_Nit] '${module}','${search}'`;
      const data = await this.accountsRepository.execute(sql);
      return {
        data,
      };
    } catch (error) {
      console.log(error);
    }
  }

  //* GET ALL ACCOUNTS WITH PHONE/EMAIL EQUALS TO SEARCHED
  @get('/account-verify-emails_phones/{search}')
  @response(200, {
    description: 'Get information of account by id',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          title: 'PingResponse',
        },
      },
    },
  })
  async verifyCiNit(@param.path.string('search') search: string) {
    try {
      const sql = `[crm4].[Accounts_Verify_Email_Phone] '${search}'`;
      const data = await this.accountsRepository.execute(sql);
      return {
        data,
      };
    } catch (error) {
      console.log(error);
    }
  }

  //* GET ALL OPPORTUNITIES BY ACCOUNTS
  @get('/account_get_opportunities/{id_account}/{id_division}')
  @response(200, {
    description: 'Get information of account by id',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          title: 'PingResponse',
        },
      },
    },
  })
  async oppotunitiesByAccount(
    @param.path.string('id_account') id_account: string,
    @param.path.string('id_division') id_division: string,
  ) {
    try {
      const sql = `[crm4].[Accounts_Get_Oportunities] '${id_account}','${id_division}'`;
      const data = await this.accountsRepository.execute(sql);
      return {
        data,
      };
    } catch (error) {
      console.log(error);
    }
  }

  //* GET ALL CONTACTS BY ACCOUNTS
  @get('/account_get_contacts/{id_account}')
  @response(200, {
    description: 'Get information of account by id',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          title: 'PingResponse',
        },
      },
    },
  })
  async contactByAccount(@param.path.string('id_account') id_account: string) {
    try {
      const sql = `[crm4].[Accounts_Get_Contacts] '${id_account}'`;
      const data = await this.accountsRepository.execute(sql);
      return {
        data,
      };
    } catch (error) {
      console.log(error);
    }
  }

  // * GET DOCUMMENTS OF THE ACCOUNTS_RELATED
  @get('/account_get_documents/{id}')
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
  async documentsByAccounts(
    @param.path.string('id') id: string,
  ): Promise<object> {
    const sql = `EXEC [${process.env.SQL_DATABASE}].[crm4].[Accounts_Get_Documents] '${id}'`;
    const data = await this.accountsRepository.execute(sql);
    return {
      data,
    };
  }
  // * END

  //* GET ALL RESERVATIONS BY ACCOUNTS
  @get('/account_get_reservations/{id_account}/{id_division}')
  @response(200, {
    description: 'Get information of account by id',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          title: 'PingResponse',
        },
      },
    },
  })
  async reservationsByAccount(
    @param.path.string('id_account') id_account: string,
    @param.path.string('id_division') id_division: string,
  ) {
    try {
      const sql = `[crm4].[Accounts_Get_Reservations] '${id_account}','${id_division}'`;
      const data = await this.accountsRepository.execute(sql);
      return {
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  //* GET ALL RESERVATIONS BY ACCOUNTS
  @get('/account_get_quotes/{id_account}/{id_division}')
  @response(200, {
    description: 'Get information of account by id',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          title: 'PingResponse',
        },
      },
    },
  })
  async quotesByAccount(
    @param.path.string('id_account') id_account: string,
    @param.path.string('id_division') id_division: string,
  ) {
    try {
      const sql = `[crm4].[Accounts_Get_Quotes] '${id_account}','${id_division}'`;
      const data = await this.accountsRepository.execute(sql);
      return {
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  //* GET ALL DELIVERIES BY ACCOUNTS
  @get('/account_get_deliveries/{id_account}/{id_division}')
  @response(200, {
    description: 'Get information of account by id',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          title: 'PingResponse',
        },
      },
    },
  })
  async deliveriesByAccount(
    @param.path.string('id_account') id_account: string,
    @param.path.string('id_division') id_division: string,
  ) {
    try {
      const sql = `[crm4].[Accounts_Get_Deliveries] '${id_account}','${id_division}'`;
      const data = await this.accountsRepository.execute(sql);
      return {
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  //* deleted mass id of module
  @patch('/bulk-module-removal')
  @response(204, {
    description: 'bulk module removal',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          title: 'delete modules',
        },
      },
    },
  })
  async bulkmoduleremoval(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
          },
        },
      },
    })
    body: any,
  ) {
    try {
      const data_send_bulk_modules_removal = {
        data: body,
      };

      const result_removed_id_for_modules = await axios.post(
        `${process.env.URL_SUITECRM_CREATE}/bulkmoduleremoval`,
        data_send_bulk_modules_removal,
        ClassGlobalFunctions.tokensutecrm,
      );

      return result_removed_id_for_modules.data;
    } catch (error) {
      throw error;
    }
  }

  //* deleted mass id of module
  @post('/bulk-module-update')
  @response(200, {
    description: 'bulk module update',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          title: 'update modules',
        },
      },
    },
  })
  async bulkmoduleupdate(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
          },
        },
      },
    })
    body: any,
  ) {
    try {
      console.log('Data', JSON.stringify(body));

      const data_send_bulk_modules_removal = {
        data: body,
      };

      const result_removed_id_for_modules = await axios.post(
        `${process.env.URL_SUITECRM_CREATE}/bulkmoduleupdate`,
        data_send_bulk_modules_removal,
        ClassGlobalFunctions.tokensutecrm,
      );

      return result_removed_id_for_modules.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * ? Filtro avanzado de cuentas, recibe como parametros 24 entradas distintas para combinarlas en el SP
   * @param object
   * @returns array
   */
  @get('/accounts_contact_filter')
  @response(200, {
    description: 'Filter advanced contact for accounts',
    content: {
      'application/json': {
        schema: {
          type: 'json',
          title: 'PingResponse',
        },
      },
    },
  })
  async contactAcountFilter(
    @param.query.object('params', {
      type: 'object',
    })
    params: {
      [key: string]: string;
    },
  ): Promise<object> {
    const {
      id_account = '',
      account = '',
      name = '',
      lastname = '',
      ci = '',
      cellphone = '',
      email = '',
      parent = '',
      country = '',
      state = '',
      city = '',
      street = '',
      created_by = '',
      assigned_to = '',
    } = params;
    console.log('entro los datos ', params, id_account);
    const sql = `EXEC [${process.env.SQL_DATABASE}].[crm4].[Accounts_Contacts_Filter]  '${id_account}','${account}','${name}','${lastname}','${ci}',
                                                                    '${cellphone}','${email}','${parent}','${country}','${state}',
                                                                    '${city}','${street}','${created_by}','${assigned_to}'`;
    try {
      const data = await this.accountsRepository.execute(sql);
      return {
        data,
      };
    } catch (error) {
      console.error(error.message);

      throw error;
    }
  }

  //* GET ALL quejas for id and module
  @get('/get_quejas/{id_module}/{name_module}/{id_division}')
  @response(200, {
    description: 'Get quejas for id account, name module and id division ',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          title: 'get quejas',
        },
      },
    },
  })
  async QuejasByModule(
    @param.path.string('id_module') id_module: string,
    @param.path.string('name_module') name_module: string,
    @param.path.string('id_division') id_division: string,
  ) {
    try {
      const sql = `[crm4].[Quejas_Get_quejas_for_id] '${id_module}','${name_module}','${id_division}'`;
      const data = await this.accountsRepository.execute(sql);
      return {
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  // * GET campaigns from an account
  @get('/account_get_campaigns/{id_account}/{id_division}')
  @response(200, {
    description: 'Get campaigns from an account',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          title: 'get campaigns',
        },
      },
    },
  })
  async campaingsFromAnAccount(
    @param.path.string('id_account') id_account: string,
    @param.path.string('id_division') id_division: string,
  ) {
    try {
      const sql = `[crm4].[Accounts_Get_Campaigns] '${id_account}','${id_division}'`;
      const data = await this.accountsRepository.execute(sql);
      return {
        status: '200',
        data,
      };
    } catch (error) {
      throw error;
    }
  }
  // * END GET campaigns from an account

  // * POST related campaigns to account
  @post('/create_related_campaings_account')
  @response(200, {
    description: 'Get campaigns from an account',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          title: 'get campaigns',
        },
      },
    },
  })
  async PostRelatedCampaingsToAccount(
    @requestBody({
      description: 'Update module',
      content: {
        'application/json': {
          schema: {
            type: 'object',
          },
          example: {
            id_account: 'b6ed46c8-05dc-4cc0-2c0f-637baa497440',
            id_campaing: '73be0498-75c3-3537-36e4-57a11e3ed3cd',
            id_user_create: '1b662fdb-486e-5e6a-45b9-5d252102f190',
            id_asigned_user: '1b662fdb-486e-5e6a-45b9-5d252102f190',
            name_campaign: 'Nuevo Gol 2016'
          },
        },
      },
    })
    body: any
  ) {
    const data_send_relation_campaign_prospect = {
      data: {
        type: "HANA_AtributosMarketing",
        attributes: {
          name: body.name_campaign,
          modified_user_id: body.id_user_create,
          created_by: body.id_user_create,
          assigned_user_id: body.id_asigned_user,
          hana_atributosmarketing_campaignscampaigns_ida: body.id_campaing,
          hana_atributosmarketing_accountsaccounts_ida: body.id_account
        }
      }
    }
    const responseRequest_campaign_accounts = await methodManagement('post', `${process.env.URL_SUITECRM_CREATE}/module`, data_send_relation_campaign_prospect) as {status: number; statusText: string; data: any;};
    if (!responseRequest_campaign_accounts) throw new HttpErrors.HttpError('indefinido en responseRequest (get-module)');
    if (responseRequest_campaign_accounts.status && responseRequest_campaign_accounts.status != 200 && responseRequest_campaign_accounts.status != 201) throw new HttpErrors.BadRequest('The relationship was not created correctly');
    return responseRequest_campaign_accounts;

  }
  // * END POST related campaigns to account

  // * DELETED related campaigns to account
  @del('/account_related_campaings/{id_account}/{id_campaign}/{id_atributomarketing}')
  @response(200, {
    description: 'Get campaigns from an account',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          title: 'get campaigns',
        },
      },
    },
  })
  async DeletedRelatedCampaingsToAccount(
    @param.path.string('id_account', {example: 'b6ed46c8-05dc-4cc0-2c0f-637baa497440'}) id_account: string,
    @param.path.string('id_campaign', {example: '73be0498-75c3-3537-36e4-57a11e3ed3cd'}) id_campaign: string,
    @param.path.string('id_atributomarketing', {example: 'e53707de-ea6d-ea85-d175-637c3bcdbc97'}) id_atributomarketing: string,
  ) {
    try {
      const responseRequestAccountswithAtribmarketing = await methodManagementKeepingData('delete', `${process.env.URL_SUITECRM_CREATE}/module/Accounts/${id_account}/relationships/hana_atributosmarketing_accounts/${id_atributomarketing}`) as {status: number; statusText: string; data: any;};
      if (!responseRequestAccountswithAtribmarketing) throw new HttpErrors.HttpError('indefinido en responseRequestAccountswithAtribmarketing (get-module)');
      if (responseRequestAccountswithAtribmarketing.status && responseRequestAccountswithAtribmarketing.status != 200 && responseRequestAccountswithAtribmarketing.status != 201) return responseRequestAccountswithAtribmarketing;

      const responseRequest = await methodManagementKeepingData('delete', `${process.env.URL_SUITECRM_CREATE}/module/HANA_AtributosMarketing/${id_atributomarketing}/relationships/hana_atributosmarketing_campaigns/${id_campaign}`) as {status: number; statusText: string; data: any;};
      if (!responseRequest) throw new HttpErrors.HttpError('indefinido en responseRequest (get-module)');
      if (responseRequest.status && responseRequest.status != 200 && responseRequest.status != 201) return responseRequest;

      return responseRequest;
    } catch (error) {
      throw error;
    }
  }
  // * END DELETED related campaigns to account

  //API PARA VERIFICAR Y ACTUALIZAR AL USUARIO PRINCIPAL
  @post('/update-relationships-accounts/{module_name}/{related_module_id}')
  @response(201, {
    description: 'update assigned users',
  })
  async updateRelationships(
    @param.path.string('module_name', {example: 'accounts'}) module_name: string,
    @param.path.string('related_module_id', {example: 'ca48118e-b2f0-12cb-ef49-5fd323ef8fa3'}) related_module_id: string,
    // obtiene parametros
    @requestBody({
      description: 'Update assigned users',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            //required: ['id_account'],
            properties: {
              type: {
                type: 'string',
              },
              attributes: {
                type: 'object',
              },
            },
          },
          example: doc.jsonExampleRelationshipUpdate(),
        },
      }
      // content: {
      //   'application/json': {
      //     schema: getModelSchemaRef(doc.modelModule, {
      //       partial: true
      //     }),
      //     example: example.jsonExampleToCreate(),
      //   },
      // },
    })
    body: type.Body
  ) {

    try {

      const {iddivision_c, idamercado_c, id_hanarelaciones: hanarelacion, idUser} = body

      //*PRIMERO TRAEMOS TODOS LOS USUARIOS RELACIONADOS A LA CUENTA EXCEPTO EL USUARIO SELECCIONADO
      const sql_get_list = `${querySQL.queries.Users_Assigned_By_Bean} '${module_name}', '${iddivision_c || ''}', '${related_module_id}', '${idamercado_c || ''}'`;
      const result_list = await this.accountsRepository.execute(sql_get_list);
      if (result_list.length > 0) {
        //const filter_result = result_list.filter((item: { id_hanarelaciones: string; }) => item.id_hanarelaciones !== id_hanarelaciones)
        //* RECORREMOS EL NUEVO ARRAY Y ACTUALIZAMOS EL ESTADO
        const result_update = await Promise.all(result_list.map(async (element: {id_hanarelaciones: string, principal: string}, index: any) => {
          if (hanarelacion == element.id_hanarelaciones && element.principal == 'no') {
            //*ACTUALIZA LA INFORMACION DE HANA_RELACIONES
            const data = {
              data: {
                "type": "HANA_Relaciones",
                "id": element.id_hanarelaciones,
                "attributes": {
                  "principal": "yes",
                  "modified_user_id": `${idUser}`
                }
              }
            }
            const resp_update = await axios.patch(`${process.env.URL_SUITECRM_CREATE}/module`, data, ClassGlobalFunctions.tokensutecrm);
            // const resp_update = await methodManagement('patch', `${process.env.URL_SUITECRM_CREATE}/module`, data) as {status: number; statusText: string; data: any;};
            //*ACTUALIZA LA TABLA DE hana_relaciones_accounts_c
            const {data: {attributes: {hana_relaciones_accountsaccounts_ida}}} = resp_update.data;
            const current_date = new Date().toISOString().replace('T', ' ').substr(0, 19);
            const values: Record<string, string> = {
              "@date_modified": `'${current_date}'`,
              "@id_account": `'${hana_relaciones_accountsaccounts_ida}'`,
              "@id_hana_relaciones": `'${hanarelacion}'`
            };
            const query_update = querySQL.queries.Update_hana_relaciones_accounts_c.replace(/@[^ \t\r\n\v\f,.;:-]*/g, matched => values[matched]);
            //const query_update = `${querySQL.queries.Update_hana_relaciones_accounts_c} '2023-02-28 09:54:00', 'ebb2bd50-4c78-60b1-7b88-63e14ed5802e', 'c2cfd30c-68b0-4859-3496-63ea4904e8d7'`;
            const result_list = await this.accountsRepository.execute(query_update);
            return resp_update.data;
          } else if (hanarelacion != element.id_hanarelaciones && element.principal == 'yes') {
            const data = {
              data: {
                "type": "HANA_Relaciones",
                "id": element.id_hanarelaciones,
                "attributes": {
                  "principal": "no",
                  "modified_user_id": `${idUser}`
                }
              }
            }

            const resp_update = await axios.patch(`${process.env.URL_SUITECRM_CREATE}/module`, data, ClassGlobalFunctions.tokensutecrm);
            //const resp_update = await methodManagement('patch', `${process.env.URL_SUITECRM_CREATE}/module`, data) as {status: number; statusText: string; data: any;};
            return resp_update.data;
            //const {data:{attributes:{hana_relaciones_accountsaccounts_ida}}} = resp_update;
          }
        }))
        return result_update;
      }
      //return body

    } catch (error) {
      console.log(error);
    }

  }
}



