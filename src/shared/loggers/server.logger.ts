import { DestinationStream } from 'pino';
import { Options } from 'pino-http';

export default {
  pinoHttp: {
    level: 'trace',
    formatters: {
      level: (label: string) => ({ level: label }),
    },
    transport: {
      target: 'pino-pretty',
      options: { translateTime: true, levelFirst: true },
    },
    serializers: {
      res(reply) {
        // The default
        return {
          statusCode: reply.statusCode,
        };
      },
      req(request) {
        if (request.method === 'OPTIONS') {
          return;
        }

        return {
          method: request.method,
          url: request.url,
          path: request.routerPath,
          parameters: request.params,
        };
      },
    },
  } as Options | DestinationStream | [Options, DestinationStream],
};
