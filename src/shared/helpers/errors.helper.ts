import { HttpStatus } from '@nestjs/common';

enum MongoErrors {
  DUPLICATE_VALUES = 11000,
}

enum ServerErrorType {
  WAS_NOT_FOUND,
  INVALID_MONGO_ID,
  DUPLICATE_VALUES,
}

class ServerError extends Error {
  readonly name: string;
  readonly message: string;
  readonly statusCode: number = 400;

  constructor(type: ServerErrorType, ...args: any[]) {
    super();

    this.name = ServerErrorType[type];

    switch (type) {
      /**
       * args[0]: Name for the entity
       * args[1]: Value
       * args[2]: Property name (default id)
       */
      case ServerErrorType.WAS_NOT_FOUND:
        this.message = `${args[0]} with ${args[2] || 'id'}: ${args[1]} was not found`;
        this.statusCode = HttpStatus.NOT_FOUND;
        break;

      /**
       * args[0]: Id value
       */
      case ServerErrorType.INVALID_MONGO_ID:
        this.message = `Given id: ${args[0]} format is invalid`;
        this.statusCode = HttpStatus.BAD_REQUEST;
        break;

      /**
       * args[0]: key value pair of duplicate keys
       */
      case ServerErrorType.DUPLICATE_VALUES:
        const list = [];
        if (typeof args[0] === 'object') {
          Object.entries(args[0]).forEach(([key, value]) => {
            list.push(`${key}: ${value}`);
          });
        }
        this.message = `Following value(s) are already exists. ${list.join(', ')}`;
        this.statusCode = HttpStatus.BAD_REQUEST;
        break;

      default:
        break;
    }
  }
}

export { MongoErrors, ServerError, ServerErrorType };
