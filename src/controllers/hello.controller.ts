import { get } from '@loopback/rest';

export class HelloController {
  @get('/hello')
  hello():string{
    return "hello world";
  }
}
