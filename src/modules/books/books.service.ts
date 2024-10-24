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
    // Tries to find an author entity by given Id, throws error if it fails to find
    const author = await this.authorModel.findById(authorId);
    if (!author)
      throw new ServerError(ServerErrorType.WAS_NOT_FOUND, 'Author', authorId);

    try {
      // Create a book with Author reference
      const book = await this.bookModel.create({
        ...bookDto,
        author: author._id,
      });

      // Push newly created book to authors array
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
      // try to find the book by id and populate author, throw not found error if it fails
      book = await this.bookModel.findById(id)?.populate(['author']);
      if (!book) {
        throw new ServerError(ServerErrorType.WAS_NOT_FOUND, 'Book', id);
      }
    } catch (e) {
      throw e;
    }

    return book;
  }

  async listBooks(): Promise<Book[]> {
    // List all the books
    const books = await this.bookModel.find();
    return books;
  }

  async updateBook(id: string, body: BookUpdateDto): Promise<Book> {
    // If an authorId is provided (assuming that we allow author of the book can be changed) check if the author exists
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
      const updateBody = { ...body };
      // Populate author property if the authorId is provided and valid
      if (body.authorId) updateBody['author'] = body.authorId;

      // Try to update book, if returning model is null throw error
      const model = await this.bookModel.findByIdAndUpdate(id, updateBody, {
        new: true,
      });

      if (!model) {
        throw new ServerError(ServerErrorType.WAS_NOT_FOUND, 'Book', id);
      }

      return model;
    } catch (e) {
      mongoErrorHandler(e);
      throw e;
    }
  }

  async deleteBook(id: string): Promise<void> {
    await this.bookModel.deleteOne({ _id: id });
  }
}
