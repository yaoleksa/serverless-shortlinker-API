import schema  from './schema';
import authSchema from './authSchema';
import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'post',
        path: '/',
        request: {
          schemas: {
            'application/json': schema,
          },
        },
      },
    },
    {
      http: {
        method: 'post',
        path: '/signup',
        request: {
          schemas: {
            'application/json': authSchema,
          }
        }
      }
    },
    {
      http: {
        method: 'get',
        path: '/',
        request: null
      }
    },
    {
      http: {
        method: 'get',
        path: '/{id}',
        request: null
      }
    },
    {
      http: {
        method: 'get',
        path: '/tables',
        request: null
      }
    },
    {
      http: {
        method: 'delete',
        path: '/{id}',
        request: null
      }
    }
  ],
};