import {Entity, model, property, hasOne} from '@loopback/repository';
import {AccountsCstm} from './accounts-cstm.model';

@model({
  name: 'accounts',
  options: {
    mssql: {
      schema: 'dbo',
      table: 'accounts'
    }
  }
})
export class Accounts extends Entity {
  @property({
    type: 'string',
    required: true,
    id: true,
    generated: false,
  })
  id?: string;

  @property({
    type: 'string',
  })
  name?: string;

  @property({
    type: 'date',
  })
  date_entered?: Date;

  @property({
    type: 'date',
  })
  date_modified?: Date;

  @property({
    type: 'string',
  })
  modified_user_id?: string;

  @property({
    type: 'string',
  })
  created_by?: string;
  
  @property({
    type: 'number',
  })
  deleted?: number;

  @property({
    type: 'string',
  })
  assigned_user_id?: string;

  @property({
    type: 'string',
  })
  phone_office?: string;

  @property({
    type: 'string',
  })
  billing_address_country?: string;

  @property({
    type: 'string',
  })
  billing_address_state?: string;

  @property({
    type: 'string',
  })
  shipping_address_city?: string;

  @hasOne(() => AccountsCstm, {keyTo: 'id_c'})
  accountsCstm: AccountsCstm;

  constructor(data?: Partial<Accounts>) {
    super(data);
  }
}

export interface AccountsRelations {
  // describe navigational properties here
}

export type AccountsWithRelations = Accounts & AccountsRelations;
