import { repository } from "@loopback/repository";
import { UsersRepository } from '../repositories/users.repository';
const jwt = require('jsonwebtoken');
export class ServiceToken{
  generarJWT = async(user:object) =>{
    return new Promise(( resolve, reject ) => {
      jwt.sign( { data:user }, 'HANSACRM4', { expiresIn: 60 * 60 * 24 * 30 },(err :boolean,token:string)=>{
          if(err){
              console.log(err);
              reject('No se pudo generar el token')
          }else{
              resolve(token);
          }
      })
    })
  }
  
}
