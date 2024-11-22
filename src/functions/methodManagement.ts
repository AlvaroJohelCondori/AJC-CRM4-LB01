import {
    HttpErrors
} from '@loopback/rest';
import axios from 'axios';
import {ClasstokenGen} from "./tokenGen";
export const methodManagement = async (method: 'post' | 'get' | 'delete' | 'patch', url: string, data_send?: object) => {
    try {
        try {
            const responseRequest = !data_send ? await axios[`${method}`](url, ClasstokenGen.tokensutecrm) : await axios[`${method}`](url, data_send, ClasstokenGen.tokensutecrm);
            const {status, statusText: statusText_a, data: {data}} = responseRequest;

            if (status && (status == 200 || status == 201)) {
                const statusText = statusText_a === 'Created' && method === 'patch' ? 'update' : statusText_a;
                const resp = {
                    status,
                    statusText,
                    data,
                }
                return resp;
            }
            if (status && status === 204) {
                return responseRequest;
            }

        } catch (error) {
            const {
                request: {res: {statusCode, statusMessage}},
                response: {status, statusText, data}
            } = error;

            if (statusCode && statusCode >= 400 && statusCode < 500) {
                // construye la respuesta de error para loopback
                const resp = {
                    RESPUESTA: '******* BACK-END SUITECRM *******',
                    status: statusCode,
                    'request.res': {
                        statusRequest: statusCode,
                        statusMessage,
                    },
                    respose: {
                        statusRequest: status,
                        statusText,
                        data,
                    }
                };
                console.log('******* ERROR BS (CONSOLE) *******')
                console.log(error);
                console.log('******* END ERROR BS (CONSOLE) *******');

                return resp;
            }
        }
    } catch (error) {
        // console.log(error.toJSON());
        // if(error.response){

        //     console.log('if...');
        //     console.log(error.response.data);
        //     console.log(error.response.status);
        //     console.log(error.response.headers);

        // }else if(error.request){
        //     console.log('else if ..')
        //     console.log(error.request);

        // }else{
        //     console.log('else...');
        //     console.log('error', error.message);
        // }
        // console.log(error.config);

        console.log('******* ERROR LB (CONSOLE) *******');
        console.log(error);
        console.log('******* END ERROR LB (CONSOLE) *******');

        if (!!error.response?.status && error.response.status === 400) {
            throw new HttpErrors.BadRequest(error.message);
        }
        throw new HttpErrors.HttpError(error.message);
        // throw new HttpErrors.HttpError(error.statusText);
    }
}

export const methodManagementKeepingData = async (method: 'post' | 'get' | 'delete' | 'patch', url: string, data_send?: object) => {
    try {
        try {
            const responseRequest = !data_send ? await axios[`${method}`](url, ClasstokenGen.tokensutecrm) : await axios[`${method}`](url, data_send, ClasstokenGen.tokensutecrm);
            const {status, statusText: statusText_a, data} = responseRequest;

            if (status && (status == 200 || status == 201)) {
                const statusText = statusText_a === 'Created' && method === 'patch' ? 'Update' : statusText_a;
                const resp = {
                    status,
                    statusText,
                    data,
                }
                return resp;
            }
            if (status && status === 204) {
                return responseRequest;
            }

        } catch (error) {
            const {
                request: {res: {statusCode, statusMessage}},
                response: {status, statusText, data}
            } = error;

            if (statusCode && statusCode >= 400 && statusCode < 500) {
                // construye la respuesta de error para loopback
                const resp = {
                    RESPUESTA: '******* BACK-END SUITECRM *******',
                    status: statusCode,
                    'request.res': {
                        statusRequest: statusCode,
                        statusMessage,
                    },
                    respose: {
                        statusRequest: status,
                        statusText,
                        data,
                    }
                };
                console.log('******* ERROR BS (CONSOLE) *******')
                console.log(error);
                console.log('******* END ERROR BS (CONSOLE) *******');

                return resp;
            }
        }
    } catch (error) {

        console.log('******* ERROR LB (CONSOLE) *******');
        console.log(error);
        console.log('******* END ERROR LB (CONSOLE) *******');

        if (!!error.response?.status && error.response.status === 400) {
            throw new HttpErrors.BadRequest(error.message);
        }
        throw new HttpErrors.HttpError(error.message);
    }
}
