import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { Observable } from 'rxjs';
import { ServerError, ServerErrorType } from '../helpers/errors.helper';

@Injectable()
export class MongoIdGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const id = request.params.id;

    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) {
      throw new ServerError(ServerErrorType.INVALID_MONGO_ID, id);
    }

    return true;
  }
}
