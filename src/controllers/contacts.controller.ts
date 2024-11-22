import {inject} from '@loopback/core';
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
  HttpErrors,
  param,
  patch,
  post,
  Request,
  requestBody,
  Response,
  response,
  RestBindings
} from '@loopback/rest';
import axios from 'axios';
import {cleanSpecialCharacters} from '../functions/cleanSpecialCharacters';
import {methodManagement} from '../functions/methodManagement';
import {
  createEmailPhones,
  deleteEmailPhones,
  updateEmailPhones,
} from '../helpers/genericRequest';
import {FILE_UPLOAD_SERVICE} from '../keys';
import {Contacts} from '../models/contacts.model';
import {ContactsRepository} from '../repositories';
import {FileUploadHandler} from '../types';
import {ClassGlobalFunctions} from './GlobalFunctions';
import {
  contacRelatedAccountContact,
  createBodyContact,
  EmailsModel,
  EmailsPhonesRequestModel,
  PhonesModel,
} from './model';

export interface RelationResponse {
  meta: Meta;
  data: DataRelation[];
}

export interface DataRelation {
  type: string;
  id: string;
  attributes: {[key: string]: string | number};
  links: Links;
}

export interface Links {
  self: string;
}

export interface Meta {
  'total-records': number;
  'total-pages': number;
  'records-on-this-page': number;
}

export class ContactsController {
  constructor(
    @repository(ContactsRepository)
    public contactsRepository: ContactsRepository,
    @inject(FILE_UPLOAD_SERVICE) private handler: FileUploadHandler,
  ) { }

  //* GET ALL CONTACT INFORMATION
  @get('/contact-get-all/{id_contact}')
  @response(200, {
    description: 'Get information of contact by id',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          title: 'PingResponse',
        },
      },
    },
  })
  async contactGetAll(
    // obtiene parametros
    @param.path.string('id_contact') id_contact: string,
    //END obtiene parametros
  ) {
    //obtiene data de Contacts
    const responseRequest = (await methodManagement(
      'get',
      `${process.env.URL_SUITECRM_CREATE}/module/Contacts/${id_contact}`,
    )) as {status: number; statusText: string; data: any};
    if (!responseRequest)
      throw new HttpErrors.HttpError(
        'indefinido en responseRequest (get-contacts)',
      );
    const {
      status,
      statusText,
      data: {type, id, attributes: attributes_resp},
    } = responseRequest;

    //obtiene data de Email
    const sql_get_email = `EXEC [${process.env.SQL_DATABASE}].[crm4].[Bean_get_Emails] contacts,'${id_contact}'`;
    const emails_r = await this.contactsRepository.execute(sql_get_email);
    if (!emails_r)
      throw new HttpErrors.HttpError('indefinido en emails_r (get-contacs)');

    //obtiene data de Phones
    const sql_get_phone = `EXEC [${process.env.SQL_DATABASE}].[crm4].[Bean_get_Phones] contacts,'${id_contact}'`;
    const phones_r = await this.contactsRepository.execute(sql_get_phone);
    if (!phones_r)
      throw new HttpErrors.HttpError('indefinido en phones_r (get-contacts)');

    //obtiene data de Comments
    const sql_get_comments = `EXEC [${process.env.SQL_DATABASE}].[crm4].[Bean_get_Comments] '${id_contact}'`;
    const comments_r = await this.contactsRepository.execute(sql_get_comments);
    if (!comments_r)
      throw new HttpErrors.HttpError('indefinido en comments_r (get-contacts)');

    //construye la respuesta para frond-end
    const resp = {
      status,
      statusText,
      info_contact: {
        detail_contact: {
          id,
          primary_address_city: attributes_resp.primary_address_city,
          primary_address_country: attributes_resp.primary_address_country,
          primary_address_state_list_c:
            attributes_resp.primary_address_state_list_c,
          industry_c: attributes_resp.industry_c,
          birthdate: attributes_resp.birthdate,
          subindustry_c: attributes_resp.subindustry_c,
          salutation: attributes_resp.salutation,
          name: attributes_resp.name,
          full_name: attributes_resp.full_name,
          first_name: attributes_resp.first_name,
          last_name: attributes_resp.last_name,
          ci_c: attributes_resp.ci_c,
          // tipo_documento_c: attributes_resp.tipo_documento_c || '',
          estado_civil_c: attributes_resp.estado_civil_c,
          genero_c: attributes_resp.genero_c,
          description: attributes_resp.description,
          principal_c: attributes_resp.principal_c,
          is_parents_c: attributes_resp.is_parents_c,
          title: attributes_resp.title,
          created_by_name: attributes_resp.created_by_name,
          modified_by_name: attributes_resp.modified_by_name,
          reports_to_id: attributes_resp.reports_to_id,
          report_to_name: attributes_resp.report_to_name,
          //date_entered: attributes_resp.date_entered,
          date_modified: attributes_resp.date_modified,
        },
        direction_contact: {
          primary_address_street: attributes_resp.primary_address_street,
          address_street_generated_c:
            attributes_resp.address_street_generated_c,
          jjwg_maps_lat_c: attributes_resp.jjwg_maps_lat_c,
          jjwg_maps_lng_c: attributes_resp.jjwg_maps_lng_c,
          jjwg_maps_address_c: attributes_resp.jjwg_maps_address_c,
        },
      },
      phone_email_contact: {
        phone_work: attributes_resp.phone_work,
        phone_mobile: attributes_resp.phone_mobile,
        phone_work_wp_c: attributes_resp.phone_work_wp_c,
        phone_work_cd_c: attributes_resp.phone_work_cd_c,
        phone_mobile_wp_c: attributes_resp.phone_mobile_wp_c,
        phone_mobile_cd_c: attributes_resp.phone_mobile_cd_c,
        emails: emails_r,
        phones: phones_r,
      },
    };
    //END construye la respuesta para frond-end
    return {
      resp,
    };
  }
  // * UPDATE DETAIL contact
  @patch('/contact-update/{contact_id}')
  @response(200, {
    description: 'Contact update',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          title: 'PingResponse',
        },
      },
    },
  })
  async contactUpdate(
    // obtiene parametros
    @param.path.string('contact_id') contact_id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              info_contact: {
                type: 'object',
              },
              phone_email_contact: {
                type: 'object',
              },
              comments: {
                type: 'object',
              },
            },
          },
        },
      },
    })
    body: createBodyContact,
    //END obtiene parametros
  ) {
    //construye JSON
    const {
      info_contact: {detail_contact, direction_contact},
    } = body;
    const attributes = Object.assign(detail_contact, direction_contact);
    const AssignedUserId = detail_contact.assigned_user_id?.id;

    delete attributes.assigned_user_id;
    delete attributes.id;
    attributes.assigned_user_id = AssignedUserId;
    const data_send = {
      data: {
        type: 'Contacts',
        id: contact_id,
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
        'indefinido en responseRequest (patch-module)',
      );
    if (
      responseRequest.status &&
      responseRequest.status != 200 &&
      responseRequest.status != 201
    )
      return responseRequest;

    const {
      status,
      statusText,
      data: {type, id, attributes: attributes_resp},
    } = responseRequest;
    // //END envía JSON a BS

    // * RESPUESTA PARA FRONTEND
    const resp = {
      status: responseRequest.status,
      info_contact: {
        detail_contact: {
          id,
          primary_address_city: attributes_resp.primary_address_city,
          primary_address_country: attributes_resp.primary_address_country,
          primary_address_state_list_c:
            attributes_resp.primary_address_state_list_c,
          industry_c: attributes_resp.industry_c,
          birthdate: attributes_resp.birthdate,
          subindustry_c: attributes_resp.subindustry_c,
          salutation: attributes_resp.salutation,
          name: attributes_resp.name,
          full_name: attributes_resp.full_name,
          first_name: attributes_resp.first_name,
          last_name: attributes_resp.last_name,
          ci_c: attributes_resp.ci_c,
          // tipo_documento_c: attributes_resp.tipo_documento_c || '',
          estado_civil_c: attributes_resp.estado_civil_c,
          genero_c: attributes_resp.genero_c,
          description: attributes_resp.description,
          principal_c: attributes_resp.principal_c,
          is_parents_c: attributes_resp.is_parents_c,
          title: attributes_resp.title,
          phone_work: attributes_resp.phone_work,
          phone_mobile: attributes_resp.phone_mobile,
          created_by_name: attributes_resp.created_by_name,
          modified_by_name: attributes_resp.modified_by_name,
          //date_entered: attributes_resp.date_entered,
          date_modified: attributes_resp.date_modified,
        },
        direction_contact: {
          primary_address_street: attributes_resp.primary_address_street,
          address_street_generated_c:
            attributes_resp.address_street_generated_c,
          jjwg_maps_lat_c: attributes_resp.jjwg_maps_lat_c,
          jjwg_maps_lng_c: attributes_resp.jjwg_maps_lng_c,
          jjwg_maps_address_c: attributes_resp.jjwg_maps_address_c,
        },
      },
    };

    // const resp = {
    //   status: attributes_resp.status,
    //   info_contact: {
    //     detail_contact: {
    //       id: id_module,
    //       primary_address_city: attributes_resp.primary_address_city,
    //       primary_address_country: attributes_resp.primary_address_country,
    //       primary_address_state_list_c:
    //         attributes_resp.primary_address_state_list_c,
    //       industry_c: attributes_resp.industry_c,
    //       birthdate: attributes_resp.birthdate,
    //       subindustry_c: attributes_resp.subindustry_c,
    //       salutation: attributes_resp.salutation,
    //       name: attributes_resp.name,
    //       full_name: attributes_resp.full_name,
    //       first_name: attributes_resp.first_name,
    //       last_name: attributes_resp.last_name,
    //       ci_c: attributes_resp.ci_c,
    //       // tipo_documento_c: attributes_resp.tipo_documento_c || '',
    //       estado_civil_c: attributes_resp.estado_civil_c,
    //       genero_c: attributes_resp.genero_c,
    //       description: attributes_resp.description,
    //     },
    //     direction_contact: {
    //       primary_address_street: attributes_resp.primary_address_street,
    //       address_street_generated_c:
    //         attributes_resp.address_street_generated_c,
    //       jjwg_maps_lat_c: attributes_resp.jjwg_maps_lat_c,
    //       jjwg_maps_lng_c: attributes_resp.jjwg_maps_lng_c,
    //       jjwg_maps_address_c: attributes_resp.jjwg_maps_address_c,
    //     },
    //   },
    //   phone_email_contact: {
    //     emails: emails_r,
    //     phones: phones_r,
    //   },
    //   comments: comments_r,
    // };
    // END respuesta para frontend
    return {
      resp,
    };
  }
  // * END SERVICIO UPDATE PARA CONTACTO

  // * DELETE MODULE WHIT LOGIN USER
  @del('/contact-delete/{contactId}/{loginUser}')
  @response(204, {
    description: 'contact DELETE success',
  })
  async contactDeleteWhitUser(
    // obtiene parametros
    @param.path.string('contactId') contactId: string,
    @param.path.string('loginUser') loginUser: string,
    //END obtiene parametros
  ) {
    //envía JSON a BS
    //methodManagement: enviar method, url, data_send = NULL
    const responseRequest = (await methodManagement(
      'delete',
      `${process.env.URL_SUITECRM_CREATE}/module/Contacts/${contactId}/${loginUser}`,
    )) as {status: number; statusText: string; data: any};
    if (!responseRequest)
      throw new HttpErrors.HttpError(
        'indefinido en responseRequest (patch-module)',
      );
    if (
      responseRequest.status &&
      responseRequest.status != 200 &&
      responseRequest.status != 201
    )
      return responseRequest;
    //END envía JSON a BS

    //respuesta para frontend
    const respMessaje =
      responseRequest.status !== 200
        ? 'row not updated in database'
        : 'contact DELETE success';
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

  // * SERVICIO PARA CREAR CONTACTO
  @post('/contact-new')
  @response(200, {
    description: 'New contact creation',
    content: {
      'application/json': {
        schema: {
          type: 'json',
          title: 'PingResponse',
        },
      },
    },
  })
  async createContact(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              info_contact: {
                type: 'object',
              },
              phone_email_contact: {
                type: 'object',
              },
              comments: {
                type: 'object',
              },
            },
          },
        },
      },
    })
    body: createBodyContact,
  ) {
    // genera JSON y envía a la api de BS
    const {
      info_contact: {detail_contact, direction_contact},
      phone_email_contact: {emails, phones},
      comments,
    } = body;
    const attributes = Object.assign(detail_contact, direction_contact);
    const data_send = {
      data: {
        type: 'Contacts',
        attributes,
      },
    };

    const responseRequest = (await methodManagement(
      'post',
      `${process.env.URL_SUITECRM_CREATE}/module`,
      data_send,
    )) as {status: number; statusText: string; data: any};
    if (!responseRequest)
      throw new HttpErrors.HttpError(
        'indefinido en responseRequest (post-contact)',
      );
    if (
      responseRequest.status &&
      responseRequest.status != 200 &&
      responseRequest.status != 201
    )
      return responseRequest;

    const {
      status,
      statusText,
      data: {type, id, attributes: attributes_resp},
    } = responseRequest;
    // END genera JSON y envía a la api de BS

    // * REGISTRO DE INFORMACIÓN DE EMAIL & TELEFONOS
    const idUser = attributes_resp.created_by;
    await createEmailPhones(
      id,
      idUser,
      phones,
      emails,
      'Contacts',
      ClassGlobalFunctions.tokensutecrm,
    );

    //obtiene data de Email
    const sql_get_email = `EXEC [${process.env.SQL_DATABASE}].[crm4].[Bean_get_Emails] contacts,'${id}'`;
    const emailsRead = await this.contactsRepository.execute(sql_get_email);
    if (!emailsRead)
      throw new HttpErrors.HttpError('indefinido en emails_r (get-contacs)');

    //obtiene data de Phones
    const sql_get_phone = `EXEC [${process.env.SQL_DATABASE}].[crm4].[Bean_get_Phones] contacts,'${id}'`;
    const phonesRead = await this.contactsRepository.execute(sql_get_phone);
    if (!phonesRead)
      throw new HttpErrors.HttpError('indefinido en phones_r (get-contacts)');

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
    const {code: code_comment, comments: resp_comment} = result_comment.data;
    // const responseRequest_comment = await methodManagement('post', `${process.env.URL_SUITECRM_CREATE}/create_comentario`, data_send_comment) as {status: number; statusText: string; data: any;};
    // if (!responseRequest_comment) throw new HttpErrors.HttpError('indefinido en responseRequest (post-contact)');
    // if (!responseRequest_comment.status && responseRequest_comment.status != 200 && responseRequest_comment.status != 201) return responseRequest_comment;
    // const resp_comment = attributes_resp;

    // * RESPUESTA FINAL AL FRONTEND
    const resp = {
      status: attributes_resp.status,
      info_contact: {
        detail_contact: {
          id,
          primary_address_city: attributes_resp.primary_address_city,
          primary_address_country: attributes_resp.primary_address_country,
          primary_address_state_list_c:
            attributes_resp.primary_address_state_list_c,
          industry_c: attributes_resp.industry_c,
          birthdate: attributes_resp.birthdate,
          subindustry_c: attributes_resp.subindustry_c,
          salutation: attributes_resp.salutation,
          name: attributes_resp.name,
          full_name: attributes_resp.full_name,
          first_name: attributes_resp.first_name,
          last_name: attributes_resp.last_name,
          ci_c: attributes_resp.ci_c,
          // tipo_documento_c: attributes_resp.tipo_documento_c || '',
          estado_civil_c: attributes_resp.estado_civil_c,
          genero_c: attributes_resp.genero_c,
          description: attributes_resp.description,
          principal_c: attributes_resp.principal_c,
          is_parents_c: attributes_resp.is_parents_c,
          title: attributes_resp.title,
          reports_to_id: attributes_resp.reports_to_id,
          report_to_name: attributes_resp.report_to_name,
          created_by_name: attributes_resp.created_by_name,
          modified_by_name: attributes_resp.modified_by_name,
          //date_entered: attributes_resp.date_entered,
          date_modified: attributes_resp.date_modified,
        },
        direction_contact: {
          primary_address_street: attributes_resp.primary_address_street,
          address_street_generated_c:
            attributes_resp.address_street_generated_c,
          jjwg_maps_lat_c: attributes_resp.jjwg_maps_lat_c,
          jjwg_maps_lng_c: attributes_resp.jjwg_maps_lng_c,
          jjwg_maps_address_c: attributes_resp.jjwg_maps_address_c,
        },
      },
      phone_email_contact: {
        phone_work: attributes_resp.phone_work,
        phone_mobile: attributes_resp.phone_mobile,
        phone_work_wp_c: attributes_resp.phone_work_wp_c,
        phone_work_cd_c: attributes_resp.phone_work_cd_c,
        phone_mobile_wp_c: attributes_resp.phone_mobile_wp_c,
        phone_mobile_cd_c: attributes_resp.phone_mobile_cd_c,
        emails: emailsRead,
        phones: phonesRead,
      },
      comments: resp_comment,
    };

    return {
      resp,
    };
  }
  // * END SERVICIO PARA CREAR CONTACTO

  @post('/photo', {
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
            },
          },
        },
        description: 'Files and fields',
      },
    },
  })
  async fileUpload(
    @requestBody.file()
    request: Request,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ): Promise<object> {
    return new Promise<object>((resolve, reject) => {
      this.handler(request, response, (err: unknown) => {
        if (err) reject(err);
        else {
          resolve(ContactsController.getFilesAndFields(request));
        }
      });
    });
  }


  /**
  * Get files and fields for the request
  * @param request - Http request
  */
  private static getFilesAndFields(request: Request) {
    const uploadedFiles = request.files;
    console.log(uploadedFiles);
    const mapper = (f: globalThis.Express.Multer.File) => ({
      fieldname: f.fieldname,
      originalname: f.originalname,
      encoding: f.encoding,
      mimetype: f.mimetype,
      size: f.size,
    });
    let files: object[] = [];
    if (Array.isArray(uploadedFiles)) {
      files = uploadedFiles.map(mapper);
    } else {
      for (const filename in uploadedFiles) {
        files.push(...uploadedFiles[filename].map(mapper));
      }
    }
    return {files, fields: request.body};
  }


  // * SERVICIO PARA TRAER LA INFORMACIÓN DE LAS CUENTAS
  @get('/contacts')
  @response(200, {
    description: 'Listado de cuentas HANSACRM',
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
      filter: object;
      sortBy: string;
      order: string;
    },
  ): Promise<object> {
    const {page, rowsPerPage, filter, sortBy, order} = params;
    const sql = `EXEC [${process.env.SQL_DATABASE}].[crm4].[Contacts_Get_List] ${page},${rowsPerPage},'${filter}','${sortBy}','${order}'`;
    const data = await this.contactsRepository.execute(sql);
    return {
      data,
    };
  }
  // END

  //* Create Phones and Email of a Contact by Id
  @post('/create-phones-emails-by-contact/{id_contact}')
  @response(200, {
    description: 'Create Phones and Emails of a Contact by Id',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          title: 'Response',
        },
      },
    },
  })
  async createPhonesAndEmailsByContact(
    @param.path.string('id_contact') idContact: string,
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
    body: EmailsPhonesRequestModel,
  ) {
    const {
      idUser,
      phones = [] as PhonesModel[],
      emails = [] as EmailsModel[],
    } = body;

    try {
      await createEmailPhones(
        idContact,
        idUser,
        phones,
        emails,
        'Contacts',
        ClassGlobalFunctions.tokensutecrm,
      );
    } catch (error) {
      if (
        !!error.responseUpdate?.status &&
        error.responseUpdate.status === 400
      ) {
        throw new HttpErrors.BadRequest(error.message);
      }
      throw new HttpErrors.HttpError(error.message);
    }
  }

  //* READ PHONES AND EMAILS OF A CONTACT BY ID
  @get('/get-phones-emails-contact/{idContact}')
  @response(200, {
    description: 'Get Phones and Emails of Contact by Id',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          title: 'Response',
        },
      },
    },
  })
  async contactGetPhonesEmails(
    @param.path.string('idContact') idContact: string,
  ) {
    try {
      const sql_get_email = `EXEC [${process.env.SQL_DATABASE}].[crm4].[Contacts_Get_Emails] '${idContact}'`;
      const emails_r = await this.contactsRepository.execute(sql_get_email);
      const sql_get_phone = `EXEC [${process.env.SQL_DATABASE}].[crm4].[Contacts_Get_Phones] '${idContact}'`;
      const phones_r = await this.contactsRepository.execute(sql_get_phone);

      return {
        emails: emails_r,
        phones: phones_r,
      };
    } catch (error) {
      console.log(error.message);
    }
  }

  //* UPDATE PHONES AND EMAILS BY CONTACT ID
  @patch('/email-phone-update-contact/{id_contact}')
  @response(200, {
    description: 'Update Phones and Email of a single Contact',
    content: {
      'application/json': {schema: {type: 'object', title: 'Response'}},
    },
  })
  async emailPhoneUpdateById(
    @param.path.string('id_contact') idContact: string,
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
    body: EmailsPhonesRequestModel,
  ) {
    const {
      idUser,
      phones = [] as PhonesModel[],
      emails = [] as EmailsModel[],
    } = body;

    try {
      const responseUpdate = await updateEmailPhones(
        idContact,
        idUser,
        phones,
        emails,
        'Contacts',
        ClassGlobalFunctions.tokensutecrm,
      );
      return responseUpdate.data;
    } catch (error) {
      if (
        !!error.responseUpdate?.status &&
        error.responseUpdate.status === 400
      ) {
        throw new HttpErrors.BadRequest(error.message);
      }
      throw new HttpErrors.HttpError(error.message);
    }
  }

  //* DELETE PHONES AND EMAILS BY CONTACT ID
  @patch('/email-phone-delete-contact/{id_contact}')
  @response(200, {
    description: 'Delete Phones and Emails of a Contact',
    content: {
      'application/json': {schema: {type: 'object', title: 'Response'}},
    },
  })
  async emailPhoneDeleteById(
    @param.path.string('id_contact') idContact: string,
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
    body: EmailsPhonesRequestModel,
  ) {
    const {
      idUser,
      phones = [] as PhonesModel[],
      emails = [] as EmailsModel[],
    } = body;

    try {
      const responseUpdate = await deleteEmailPhones(
        idContact,
        idUser,
        phones,
        emails,
        'Contacts',
        ClassGlobalFunctions.tokensutecrm,
      );
      if (responseUpdate.status !== 200) {
        throw new HttpErrors.HttpError(responseUpdate.statusText);
      }
      return responseUpdate.data;
    } catch (error) {
      if (
        !!error.responseUpdate?.status &&
        error.responseUpdate.status === 400
      ) {
        throw new HttpErrors.BadRequest(error.message);
      }
      throw new HttpErrors.HttpError(error.message);
    }
  }

  // * GET total Accounts in one number
  // @get('/contacts-total')
  // @response(200, {
  //   description: 'Get total Contacts HANSACRM',
  //   content: {
  //     'application/json': {
  //       schema: {
  //         type: 'json',
  //         title: 'PingResponse',
  //       },
  //     },
  //   },
  // })
  // async gettotal(
  //   @param.query.object('filter', {
  //     type: 'object',
  //     properties: {
  //       filter: {
  //         type: 'string'
  //       }
  //     }
  //   }) params: {
  //     filter: string,
  //   }
  // ): Promise<object> {
  //   const {filter} = params
  //   const sql = `EXEC [${process.env.SQL_DATABASE}].[crm4].[Contacts_Get_Total] '${filter}'`;
  //   const data = await this.contactsRepository.execute(sql);
  //   return data[0].total
  // }
  // * END

  // * GET service to bring the information of an account
  @get('/contacts-getContacts/{id}')
  @response(200, {
    description: 'Get contacts HANSACRM',
    content: {
      'application/json': {
        schema: {
          type: 'json',
          title: 'PingResponse',
        },
      },
    },
  })
  async getContacts(@param.path.string('id') id: string): Promise<object> {
    const sql = `EXEC [${process.env.SQL_DATABASE}].[crm4].[Contacts_Get_ToSeeContact] '${id}'`;
    const data = await this.contactsRepository.execute(sql);
    return {
      data,
    };
  }
  // * END

  /**
   * ? Filtro avanzado de cuentas, recibe como parametros 24 entradas distintas para combinarlas en el SP
   * @param object
   * @returns array
   */
  @get('/contacts_advanced_filter')
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
    const {
      easyFilter = '',
      name = '',
      lastname = '',
      ci = '',
      parent = '',
      cellphone = '',
      email = '',
      country = '',
      state = '',
      city = '',
      street = '',
      account = '',
      created_by = '',
      modified_by = '',
      assigned_to = '',
      creation_date = {from: '', to: '', operator: ''},
    } = filter;

    const {from, to, operator} = creation_date;

    const sql = `EXEC [${process.env.SQL_DATABASE}].[crm4].[Contacts_Get_List] ${page},${rowsPerPage},'${sortBy}','${order}','${cleanSpecialCharacters(
      easyFilter,
    )}',
                                                            '${cleanSpecialCharacters(
      name,
    )}','${cleanSpecialCharacters(
      lastname,
    )}','${cleanSpecialCharacters(ci)}','${cleanSpecialCharacters(
      parent,
    )}','${cleanSpecialCharacters(cellphone)}','${cleanSpecialCharacters(
      email,
    )}',
                                                            '${country}','${state}','${cleanSpecialCharacters(
      city,
    )}','${cleanSpecialCharacters(street)}','${account}',
                                                            '${created_by}','${modified_by}','${assigned_to}','${from}','${to}','${operator}'`;

    try {
      const data = await this.contactsRepository.execute(sql);
      return {
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  // * GET total Accounts in one number
  @get('/contacts-total')
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
      ci = '',
      parent = '',
      cellphone = '',
      email = '',
      country = '',
      state = '',
      city = '',
      street = '',
      account = '',
      created_by = '',
      modified_by = '',
      assigned_to = '',
      creation_date = {from: '', to: '', operator: ''},
    } = filter;

    const {from, to, operator} = creation_date;

    const sql = `EXEC [${process.env.SQL_DATABASE}].[crm4].[Contacts_Get_Total] '${easyFilter}','${name}','${lastname}','${ci}','${parent}','${cellphone}',
                                                              '${email}','${country}','${state}','${city}','${street}',
                                                              '${account}','${created_by}','${modified_by}','${assigned_to}','${from}','${to}','${operator}'`;
    const data = await this.contactsRepository.execute(sql);
    return data[0].total;
  }
  // * END

  // * GET service to bring the information of an account
  @post('/contact_related_accounts')
  @response(200, {
    description: 'create contact related accounts',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          title: 'contact related accounts',
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
    body: contacRelatedAccountContact,
  ) {
    try {
      const data_send_contact_related_accounts = {
        data: body,
      };

      const result_removed_id_for_modules = await axios.post(
        `${process.env.URL_SUITECRM_CREATE}/contact-related-account`,
        data_send_contact_related_accounts,
        ClassGlobalFunctions.tokensutecrm,
      );

      return result_removed_id_for_modules.data;
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  }
  // * END

  @post('/contact-module-relation')
  @response(200, {
    description: 'Create a relation between a contact and a module',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          title: 'Create contact relation',
        },
        examples: {
          code: 200,
          module: 'Leads',
          id_module: '76b655b2-2e95-7421-0345-636b990d2a63',
          relationship: [
            [
              'Leads with ID 76b655b2-2e95-7421-0345-636b990d2a63 is related to Contacts with id 10060f56-76f2-82ac-96cd-637eee31e9ed',
            ],
          ],
        },
      },
    },
  })
  async createRelationWithContact(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
          },
        },
      },
    })
    body: contacRelatedAccountContact,
  ) {
    try {
      const data_send_contact_related_accounts = {
        data: body,
      };

      const result_removed_id_for_modules = await axios.post(
        `${process.env.URL_SUITECRM_CREATE}/contact-related-account`,
        data_send_contact_related_accounts,
        ClassGlobalFunctions.tokensutecrm,
      );

      return result_removed_id_for_modules.data;
    } catch (error) {
      if (error.response.status === 400)
        throw new HttpErrors.BadRequest(error.response.data);
      if (error.response.status !== 201 || error.response.status !== 200)
        throw new HttpErrors[500]('Internal error, please check logs');
    }
  }

  @get('/relations/{module}/{id_module}/{related_module}')
  async getRelationBetweenModules(
    @param.path.string('module') module: string,
    @param.path.string('id_module') moduleId: string,
    @param.path.string('related_module') relatedModule: string,
  ) {
    try {
      const {data} = await axios.get<RelationResponse>(
        `${process.env.URL_SUITECRM_CREATE
        }/module/${module}/${moduleId}/relationships/${relatedModule.toLowerCase()}`,
        ClassGlobalFunctions.tokensutecrm,
      );

      return data;
    } catch (error) {
      console.log(error);
      throw new HttpErrors.HttpError('check logs for details');
    }
  }

  //--------------------
  // * GET service to bring the information of history of changes
  @get('/contacts-getHistoryChanges/{id}')
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
    const sql = `EXEC [${process.env.SQL_DATABASE}].[crm4].[Contacts_Get_History_Changes] '${id}'`;
    const data = await this.contactsRepository.execute(sql);
    return {
      data,
    };
  }
  // * END

  //* GET ALL OPPORTUNITIES BY CONTACTS
  @get('/contacts_get_opportunities/{id_contact}/{id_division}')
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
  async contactsByAccount(
    @param.path.string('id_contact') id_contact: string,
    @param.path.string('id_division') id_division: string,
  ) {
    try {
      const sql = `[crm4].[Contacts_Get_Oportunities] '${id_contact}','${id_division}'`;
      const data = await this.contactsRepository.execute(sql);
      return {
        data,
      };
    } catch (error) {
      console.log(error);
    }
  }

  //* GET ALL OPPORTUNITIES BY CONTACTS
  @get('/Contacts_Get_Quotes/{id_contact}/{id_division}')
  @response(200, {
    description: 'Get information of contatcs by id',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          title: 'PingResponse',
        },
      },
    },
  })
  async contactsByQuotes(
    @param.path.string('id_contact') id_contact: string,
    @param.path.string('id_division') id_division: string,
  ) {
    try {
      const sql = `[crm4].[Contacts_Get_Quotes] '${id_contact}','${id_division}'`;
      const data = await this.contactsRepository.execute(sql);
      return {
        data,
      };
    } catch (error) {
      console.log(error);
    }
  }

  //* GET ALL OPPORTUNITIES BY CONTACTS
  @get('/Contacts_Get_Documents/{id_contact}')
  @response(200, {
    description: 'Get information of contacts by id',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          title: 'PingResponse',
        },
      },
    },
  })
  async contactsByDocuments(
    @param.path.string('id_contact') id_contact: string,
  ) {
    try {
      const sql = `[crm4].[Contacts_Get_Documents] '${id_contact}'`;
      const data = await this.contactsRepository.execute(sql);
      return {
        data,
      };
    } catch (error) {
      console.log(error);
    }
  }

  //* GET ALL OPPORTUNITIES BY CONTACTS
  @get('/Contacts_Get_Relatives/{id_contact}/{id_division}')
  @response(200, {
    description: 'Get information of contatcs by id',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          title: 'PingResponse',
        },
      },
    },
  })
  async contactsByRelatives(
    @param.path.string('id_contact') id_contact: string,
    @param.path.string('id_division') id_division: string,
  ) {
    try {
      const sql = `[crm4].[Contacts_Get_Relatives] '${id_contact}','${id_division}'`;
      const data = await this.contactsRepository.execute(sql);
      return {
        data,
      };
    } catch (error) {
      console.log(error);
    }
  }

  //* GET ALL RESERVATIONS BY CONTACTS
  @get('/contact_get_reservations/{id_contact}/{id_division}')
  @response(200, {
    description: 'Get information of contact by id',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          title: 'PingResponse',
        },
      },
    },
  })
  async reservationsByContact(
    @param.path.string('id_contact') id_contact: string,
    @param.path.string('id_division') id_division: string,
  ) {
    try {
      const sql = `[crm4].[Contacts_Get_Reservations] '${id_contact}','${id_division}'`;
      const data = await this.contactsRepository.execute(sql);
      return {
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  //* GET ALL DELIVERIES BY CONTACTS
  @get('/contact_get_deliveries/{id_contact}/{id_division}')
  @response(200, {
    description: 'Get information of contact by id',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          title: 'PingResponse',
        },
      },
    },
  })
  async deliveriesByContact(
    @param.path.string('id_contact') id_contact: string,
    @param.path.string('id_division') id_division: string,
  ) {
    try {
      const sql = `[crm4].[Contacts_Get_Deliveries] '${id_contact}','${id_division}'`;
      const data = await this.contactsRepository.execute(sql);
      return {
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  //* GET ALL RELATIONS BY CONTACT
  @get('/contact_get_relations/{id_contact}')
  @response(200, {
    description: 'Get information of contact by id',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          title: 'PingResponse',
        },
      },
    },
  })
  async relationsByContact(
    @param.path.string('id_contact') id_contact: string,
  ) {
    try {
      const sql = `[crm4].[Contacts_Get_Related_Account] '${id_contact}'`;
      const data = await this.contactsRepository.execute(sql);
      return {
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  // * POST service to delete relation contact to account and account to contacts
  @post('/contact_related_accounts_delete')
  @response(200, {
    description: 'create contact related accounts',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          title: 'contact related accounts',
        },
      },
    },
  })
  async deletecontactofaccount(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
          },
        },
      },
    })
    body: contacRelatedAccountContact,
  ) {
    try {
      const data_send_contact_related_accounts = {
        data: body,
      };

      const result_removed_id_for_modules = await axios.post(
        `${process.env.URL_SUITECRM_CREATE}/contact-related-account-delete`,
        data_send_contact_related_accounts,
        ClassGlobalFunctions.tokensutecrm,
      );

      return result_removed_id_for_modules.data;
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  }
  // * END
  // * GET service to bring the information of assigned accounts on accounts
  @get('/contacts_assigned_user/{id}')
  @response(200, {
    description: 'Get Contact Assgined by Id HANSACRM',
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
    const sql = `EXEC [${process.env.SQL_DATABASE}].[crm4].[User_Assigned_By_Bean] contacts, '${id}'`;
    const data = await this.contactsRepository.execute(sql);
    return {
      data,
    };
  }
  // * END

  @get('/contacts/reports-to/{id}')
  @response(200, {
    description: 'Get contacts those report to an account',
    content: {
      'application/json': {
        schema: {
          type: 'json',
          title: 'ContactResponse',
        },
      },
    },
  })
  async getReportedContacts(@param.path.string('id') contactId: string) {
    const sql = `EXEC [crm4].[Organigramas_Get_Contacts_From_Reports] @ContactId = '${contactId}' `;
    const response = await this.contactsRepository.execute(sql);
    return response as object[];
  }

  //!CRUD POR DEFECTO DE LOOPBACK4
  @post('/Contacts')
  @response(200, {
    description: 'Accounts model instance',
    content: {'application/json': {schema: getModelSchemaRef(Contacts)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Contacts, {
            title: 'NewContacts',
            //exclude: ['id'],
          }),
        },
      },
    })
    contacts: Omit<Contacts, 'id'>,
  ): Promise<Contacts> {
    return this.contactsRepository.create(contacts);
  }

  @get('/Contacts/count')
  @response(200, {
    description: 'Contacts model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Contacts) where?: Where<Contacts>): Promise<Count> {
    return this.contactsRepository.count(where);
  }

  @get('/Contacts')
  @response(200, {
    description: 'Array of Contacts model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Contacts, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Contacts) filter?: Filter<Contacts>,
  ): Promise<Contacts[]> {
    return this.contactsRepository.find(filter);
  }

  //!END CRUD POR DEFECTO DE LOOPBACK4
}
