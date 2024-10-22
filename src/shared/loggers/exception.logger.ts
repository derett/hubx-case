import pino from 'pino';

export default pino({
  level: 'debug',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: false,
      translateTime: 'yyyy-mm-dd HH:MM:ss',
      ignore: 'level,pid,hostname',
      messageFormat: '[REQUEST]\t{msg}\n',
    },
  },
});
