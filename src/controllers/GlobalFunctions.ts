export class ClassGlobalFunctions {
  //solucion momentanea
  public static tokensutecrm={
    headers: {
      'Authorization': `Bearer ${process.env.TOKEN_CRM4_BS_HANSACRM4}`,
      'content-type': 'application/json'
    }
  };
 //END solucion momentanea

 // funcion para obtener token de suitecrm
  public tokenBackEndSuiteCrm() {
    const tokensutecrm = {
      headers: {
        'Authorization': `Bearer ${process.env.TOKEN_CRM4_BS_HANSACRM4}`,
        'content-type': 'application/json'
      }
    }
    return tokensutecrm;
  }
  // END funcion para obtener token de suitecrm
}

