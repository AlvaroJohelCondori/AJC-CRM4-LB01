import {Entity, model, property} from '@loopback/repository';

@model({
  name: 'accounts_cstm',
  options: {
    mssql: {
      schema: 'dbo',
      table: 'accounts_cstm'
    }
  }
})
export class AccountsCstm extends Entity {
  @property({
    type: 'string',
    id: true
  })
  id_c?: string;

  @property({
    type: 'string',
  })
  nit_ci_c?: string;

  @property({
    type: 'string',
  })
  idcuentasap_c?: string;

  @property({
    type: 'string',
  })
  tipocuenta_c?: string;

  @property({
    type: 'string',
  })
  nombre_comercial_c?: string;

  @property({
    type: 'string',
  })
  subindustry_c?: string;

  @property({
    type: 'number',
  })
  jjwg_maps_lat_c?: number;

  @property({
    type: 'number',
  })
  jjwg_maps_lng_c?: number;

  @property({
    type: 'string',
  })
  names_c?: string;

  @property({
    type: 'string',
  })
  lastname_c?: string;

  @property({
    type: 'number',
  })
  celular_c?: number;

  @property({
    type: 'string',
  })
  tipo_documento_c?: string;


  constructor(data?: Partial<AccountsCstm>) {
    super(data);
  }
}

export interface AccountsCstmRelations {
  // describe navigational properties here
}

export type AccountsCstmWithRelations = AccountsCstm & AccountsCstmRelations;
