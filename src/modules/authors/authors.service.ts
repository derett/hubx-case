import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Author } from 'src/schemas/author.schema';
import {
  MongoErrors,
  ServerError,
  ServerErrorType,
} from 'src/shared/helpers/errors.helper';
import { isMongoServerError } from 'src/shared/types/mixed';
import { AuthorCreateDto } from './dtos/author.create.dto';
import { AuthorUpdateDto } from './dtos/author.update.dto';

@Injectable()
export class AuthorsService {
  constructor(@InjectModel(Author.name) private authorModel: Model<Author>) {}

  async createAuthor(body: AuthorCreateDto): Promise<Author> {
    try {
      const author = await this.authorModel.create(body);
      return author;
    } catch (e) {
      if (isMongoServerError(e)) {
        switch (e.code) {
          case MongoErrors.DUPLICATE_VALUES:
            if (typeof e.keyValue === 'object') {
              throw new ServerError(
                ServerErrorType.DUPLICATE_VALUES,
                e.keyValue,
              );
            }
            break;

          default:
            break;
        }
      }
      throw e;
    }
  }

  async findAuthor(id: string): Promise<Author> {
    let author;

    try {
      author = await this.authorModel.findById(id)?.populate(['books']);
      if (!author) {
        throw new ServerError(ServerErrorType.WAS_NOT_FOUND, 'Author', id);
      }
    } catch (e) {
      throw e;
    }

    return author;
  }

  async listAuthors(): Promise<Author[]> {
    const authors = await this.authorModel.find();
    return authors;
  }

  async updateAuthor(id: string, body: AuthorUpdateDto): Promise<Author> {
    try {
      return this.authorModel.findByIdAndUpdate(id, body, { new: true });
    } catch (e) {
      if (isMongoServerError(e)) {
        switch (e.code) {
          case MongoErrors.DUPLICATE_VALUES:
            if (typeof e.keyValue === 'object') {
              throw new ServerError(
                ServerErrorType.DUPLICATE_VALUES,
                e.keyValue,
              );
            }
            break;

          default:
            break;
        }
      }
      throw e;
    }
  }

  async deleteAuthor(id: string): Promise<void> {
    await this.authorModel.deleteOne({ _id: id });
  }
}
