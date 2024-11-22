import {Entity, model, property} from '@loopback/repository';

@model({
  name: 'documents',
  options: {
    mssql: {
      schema: 'dbo',
      table: 'documents'
    }
  }
})
export class Documents extends Entity {
  @property({
    type: 'string',
    required: true,
    id: true
  })
  id?: string;

  @property({
    type: 'string',
  })
  document_name?: string;

  constructor(data?: Partial<Documents>) {
    super(data);
  }
}

export interface DocumentsRelations {
  // describe navigational properties here
}

export type DocumentsWithRelations = Documents & DocumentsRelations;
