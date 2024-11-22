import {Entity, model, property} from '@loopback/repository';

@model({
  name: 'contacts',
  options: {
    mssql: {
      schema: 'dbo',
      table: 'contacts'
    }
  }
})
export class Contacts extends Entity {
  @property({
    type: 'string',
    required: true,
    id: true
  })
  id?: string;

  @property({
    type: 'string',
  })
  first_name?: string;

  constructor(data?: Partial<Contacts>) {
    super(data);
  }
}

export interface ContactsRelations {
  // describe navigational properties here
}

export type ContactsWithRelations = Contacts & ContactsRelations;
