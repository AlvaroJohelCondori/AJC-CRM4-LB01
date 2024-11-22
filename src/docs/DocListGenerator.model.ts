import {Entity, model, property} from '@loopback/repository';
// import {Accounts} from '../models/accounts.model';

@model()
class dateFilter {
  @property({
    type: 'string'
  })
  column: string;

  @property({
    type: 'string'
  })
  from: string;

  @property({
    type: 'string'
  })
  to: string;
}

@model()
class concatColumnsFilter {

  @property({
    type: 'string',
  })
  column: string;

  @property({
    type: 'string',
  })
  table: string;
}


@model()
class columnsFilter {
  @property({
    type: 'string'
  })
  column: string;

  @property({
    type: 'string'
  })
  table: string;

  @property({
    type: 'string'
  })
  valueFilterAdvance: string;

  @property({
    type: 'string',
    default: '~'
  })
  typeFilterAdvance: string;

  @property({
    type: 'boolean',
    defalt: false
  })
  columnforfilterPrincipal: boolean
}

@model()
class phonesFilter {
  @property({
    type: 'string',
  })
  column: string

  @property({
    type: 'string'
  })
  table: string;
}

@model()
export class modelListGenerator extends Entity {

  @property({
    type: 'number',
    default: 1
  })
  page: number;

  @property({
    type: 'number',
    default: 10
  })
  rowsPerPage: number;

  @property({
    type: 'string',
  })
  order: string;

  @property({
    type: 'array',
    itemType: 'string',
  })
  created_by: string[];

  @property({
    type: 'array',
    itemType: 'string',
  })
  modified_by: string[];

  @property({
    type: 'array',
    itemType: 'string',
  })
  assigned_to: string[];

  @property({
    type: 'array',
    itemType: 'object'
  })
  dateFilter: dateFilter[];

  @property({
    type: 'string'
  })
  columnsFilterValuePrincipal: string;

  @property({
    type: 'array',
    itemType: 'object'
  })
  columnsFilter: columnsFilter[];

  // @property.array(Accounts, {required: true})
  // products: Accounts[];

  constructor(data?: Partial<modelListGenerator>) {
    super(data);
  }
}

export interface modelCreateRelations {
  // describe navigational properties here
}

export type EjemploModelWithRelations = modelListGenerator & modelCreateRelations;


