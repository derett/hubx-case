import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Author } from 'src/schemas/author.schema';
import { Book } from 'src/schemas/book.schema';
import { ServerError, ServerErrorType } from 'src/shared/helpers/errors.helper';
import mongoErrorHandler from 'src/shared/helpers/mongo.error.handler';
import { BookCreateDto } from './dtos/book.create.dto';
import { BookUpdateDto } from './dtos/book.update.dto';

@Injectable()
export class BooksService {
  constructor(
    @InjectModel(Book.name) private bookModel: Model<Book>,
    @InjectModel(Author.name) private authorModel: Model<Author>,
  ) {}

  async createBook({ authorId, ...bookDto }: BookCreateDto): Promise<Book> {
    const author = await this.authorModel.findById(authorId);
    if (!author)
      throw new ServerError(ServerErrorType.WAS_NOT_FOUND, 'Author', authorId);

    try {
      const book = await this.bookModel.create({
        ...bookDto,
        author: author._id,
      });

      await author.updateOne({
        $push: {
          books: book._id,
        },
      });
      return book;
    } catch (e) {
      mongoErrorHandler(e);
      throw e;
    }
  }

  async findBook(id: string): Promise<Book> {
    let book;

    try {
      book = await this.bookModel.findOne({ _id: id });
      if (!book) {
        throw new ServerError(ServerErrorType.WAS_NOT_FOUND, 'Book', id);
      }
    } catch (e) {
      throw e;
    }

    return book;
  }

  async listBooks(): Promise<Book[]> {
    const books = await this.bookModel.find();
    return books;
  }

  async updateBook(id: string, body: BookUpdateDto): Promise<Book> {
    if (body.authorId) {
      const author = await this.authorModel.findById(body.authorId);
      if (!author)
        throw new ServerError(
          ServerErrorType.WAS_NOT_FOUND,
          'Author',
          body.authorId,
        );
    }

    try {
      await this.bookModel.updateOne(
        { _id: id },
        { ...body, author: body.authorId },
      );
      const updatedBook = this.bookModel.findById(id);
      return updatedBook;
    } catch (e) {
      mongoErrorHandler(e);
      throw e;
    }
  }

  async deleteBook(id: string): Promise<void> {
    await this.bookModel.deleteOne({ _id: id });
  }
}
