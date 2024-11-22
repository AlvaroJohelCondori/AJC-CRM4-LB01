export class ClasstokenGen {
  //construye JSON para token
  public static tokensutecrm={
    headers: {
      'Authorization': `Bearer ${process.env.TOKEN_CRM4_BS_HANSACRM4}`,
      'content-type': 'application/json'
    }
  };
 //construye JSON para token
}