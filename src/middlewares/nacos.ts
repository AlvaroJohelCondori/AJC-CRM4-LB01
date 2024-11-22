import {NacosConfigClient} from 'nacos';   // ts
export const configEnv = async() => {
  // for direct mode
  const configClient = new NacosConfigClient({
    serverAddr: process.env.NACOS_SERVERADDR,
    namespace: process.env.NACOS_NAMESPACE,
    identityKey: process.env.NACOS_IDENTITYKEY,
    identityValue: process.env.NACOS_IDENTITYVALUE
  });

  const content= await configClient.getConfig(process.env.NACOS_ENV, 'DEFAULT_GROUP');
  console.log('getConfig = ',content);

  configClient.subscribe({
    dataId: process.env.NACOS_ENV,
    group: 'DEFAULT_GROUP',
  }, (content: any) => {
    console.log(content);
  });
  
  const jsonData = JSON.parse(content.toString());
  for(let item in jsonData){
    process.env[(item.toUpperCase())] = jsonData[item]
  }
}