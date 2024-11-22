import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {HansacrmDataSource} from '../datasources';
import {Contacts, ContactsRelations} from '../models';
export class ContactsRepository extends DefaultCrudRepository<
  Contacts,
  typeof Contacts.prototype.id,
  ContactsRelations
> {
  constructor(
    @inject('datasources.HANSACRM') dataSource: HansacrmDataSource,
  ) {
    super(Contacts, dataSource);
  }
}
