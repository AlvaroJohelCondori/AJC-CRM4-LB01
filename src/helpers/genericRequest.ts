import {AnyObject} from '@loopback/repository';
import axios from 'axios';
import {EmailsModel, PhonesModel} from '../controllers/model';

function createSuiteBody(
  module: string,
  id: string,
  idUser: string,
  phones = [] as PhonesModel[],
  emails = [] as EmailsModel[],
) {
  return {
    data: {
      module,
      idModule: id,
      idUser: idUser,
      relatemodule: [
        {
          nameModule: 'EmailAddress',
          items: emails,
        },
        {
          nameModule: 'pho_phones',
          items: phones,
        },
      ],
    },
  };
}

export const createEmailPhones = (
  id: string,
  idUser: string,
  phones: PhonesModel[],
  emails: EmailsModel[],
  module: string,
  token: object,
) => {
  const suiteBody = createSuiteBody(module, id, idUser, phones, emails);
  console.log(JSON.stringify(suiteBody));

  return axios.post(
    `${process.env.URL_SUITECRM_CREATE}/emails-phone-create`,
    suiteBody,
    token,
  );
};

export const readEmailPhones = async (
  id: string,
  module: 'Accounts' | 'Contacts',
  execute: (nameFunction: string) => Promise<AnyObject>,
) => {
  if (module === 'Accounts') {
    const sqlGetEmail = `EXEC [${process.env.SQL_DATABASE}].[crm4].[BeanId_get_Email] '${id}'`;
    const emails = await execute(sqlGetEmail);
    const sqlGetPhones = `EXEC [${process.env.SQL_DATABASE}].[crm4].[BeanId_get_phones] '${id}'`;
    const phones = await execute(sqlGetPhones);
    return {
      emails,
      phones,
    };
  }
};

export const updateEmailPhones = (
  id: string,
  idUser: string,
  phones: PhonesModel[],
  emails: EmailsModel[],
  module: string,
  token: object,
) => {
  const suiteBody = createSuiteBody(module, id, idUser, phones, emails);

  return axios.patch(
    `${process.env.URL_SUITECRM_CREATE}/emails-phone-update`,
    suiteBody,
    token,
  );
};

export const deleteEmailPhones = (
  id: string,
  idUser: string,
  phones: PhonesModel[],
  emails: EmailsModel[],
  module: string,
  token: object,
) => {
  const suiteBody = createSuiteBody(module, id, idUser, phones, emails);

  return axios.patch(
    `${process.env.URL_SUITECRM_CREATE}/emails-phone-delete`,
    suiteBody,
    token,
  );
};
