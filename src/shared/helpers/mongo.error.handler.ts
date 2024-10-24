import { isMongoServerError } from '../types/mixed';
import { MongoErrors, ServerError, ServerErrorType } from './errors.helper';
/**
 * If given error is a Mongo Server Error tries to handle exception according to its Code, If cannot simply returns void
 * @param e: Error
 */
export default function (e: any) {
  if (isMongoServerError(e)) {
    switch (e.code) {
      case MongoErrors.DUPLICATE_VALUES:
        if (typeof e.keyValue === 'object') {
          throw new ServerError(ServerErrorType.DUPLICATE_VALUES, e.keyValue);
        }
        break;

      default:
        break;
    }
  }
}
