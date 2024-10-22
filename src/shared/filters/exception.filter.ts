import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { omit } from 'lodash';

import exceptionLogger from 'src/shared/loggers/exception.logger';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    const body = omit(request.body, ['media', 'pictures', 'picture']);
    const statusCode =
      exception.status ||
      exception.statusCode ||
      (exception.response && exception.response.statusCode) ||
      500;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { file, ...bodyTrimmed } = body;

    const message = {
      method: request.method,
      route: request.url,
      userAgent: request.headers['user-agent'],
      statusCode,
      body: bodyTrimmed || {},
      params: request.params || {},
      query: request.query || {},
      error: exception,
    };

    if (statusCode !== 404) {
      exceptionLogger.debug(JSON.stringify(message));
    }

    response.status(statusCode).send(exception);
  }
}
