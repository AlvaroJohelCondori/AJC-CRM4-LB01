export interface createBody {
  info_account: {
    detail_account: object;
    direction_account: object;
  };
  phone_email_account: {
    emails: EmailsModel[];
    phones: PhonesModel[];
  };
  assigned_users: object[];
  comments: createComments;
  related_accounts: object[];
}

export interface createComments {
  module: string;
  idmodule: string;
  visualizacion_c: string;
  description: string;
  relevance: string;
  modulecoments: string;
}

export interface createBodyContact {
  info_contact: {
    detail_contact: any;
    direction_contact: any;
  };
  phone_email_contact: {
    emails: EmailsModel[];
    phones: PhonesModel[];
  };
  comments: createComments;
}

export interface contacRelatedAccountContact {
  module: string;
  id_module: string;
  id_user: string;
  relationship: object[];
}

export type SchemaTypeModel =
  | 'integer'
  | 'number'
  | 'string'
  | 'boolean'
  | 'object'
  | 'null'
  | 'array';
export interface PhonesModel {
  id: string;
  phone: string;
  country: string;
  country_code: string;
  whatsapp: string;
  principal: string;
}

export interface EmailsModel {
  id: string;
  email_address: string;
  primary_item: boolean;
}

export interface EmailsPhonesRequestModel {
  idUser: string;
  phones: PhonesModel[];
  emails: EmailsModel[];
}

export interface listGenerator {
  page: string,
  rowsPerPage: string,
  order: string,
  created_by: [],
  modified_by: [],
  assigned_to: [],
  dateFilter: [{
    column: string,
    option?: string,
    from: string,
    to: string,
    operator: string,
  }],
  columnsFilterValuePrincipal: string,
  columnsFilter: [{
    column: string,
    table: string,
    valueFilterAdvance: string,
    typeFilterAdvance: string,
    columnforfilterPrincipal: boolean,
  }]
}

export interface createRelationcampaigntoaccount {
  id_account: string,
  id_campaing: string,
  id_user_create: string,
  id_asigned_user: string,
  name_campaign: string
}
