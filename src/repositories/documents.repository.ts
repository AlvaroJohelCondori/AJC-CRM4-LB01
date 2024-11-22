import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {HansacrmDataSource} from '../datasources';
import {Documents, DocumentsRelations} from '../models';
export class DocumentsRepository extends DefaultCrudRepository<
  Documents,
  typeof Documents.prototype.id,
  DocumentsRelations
> {
  constructor(
    @inject('datasources.HANSACRM') dataSource: HansacrmDataSource,
  ) {
    super(Documents, dataSource);
  }
}
