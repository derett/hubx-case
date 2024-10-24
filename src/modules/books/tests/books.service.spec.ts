import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import authorsTestData from 'src/modules/authors/tests/authors.test.data';
import { Author } from 'src/schemas/author.schema';
import { Book } from 'src/schemas/book.schema';
import { ServerError, ServerErrorType } from 'src/shared/helpers/errors.helper';
import { BooksService } from '../books.service';
import { BookCreateDto } from '../dtos/book.create.dto';
import { BookUpdateDto } from '../dtos/book.update.dto';
import booksTestData from './books.test.data';

describe('BooksService', () => {
  let service: BooksService;
  const mockBookModel = {
    create: jest.fn().mockImplementation((dto: BookCreateDto) => {
      const { authorId, ...rest } = dto;
      return {
        _id: new mongoose.Types.ObjectId().toString(),
        __v: 0,
        author: authorId,
        ...rest,
      };
    }),
    findById: jest.fn().mockImplementation((id: string) => {
      const exists = booksTestData.pickOneById(id);

      if (exists) {
        return {
          ...exists,
          populate: jest.fn().mockReturnValue(booksTestData.populateAuthor(id)),
        };
      }
      return booksTestData.pickOneById(id);
    }),
    find: jest.fn().mockResolvedValue(booksTestData.getBooks()),
    findOne: jest.fn().mockImplementation((props: { _id: string }) => {
      return booksTestData.pickOneById(props._id);
    }),
    findByIdAndUpdate: jest
      .fn()
      .mockImplementation((id: string, dto: BookUpdateDto) => {
        const exists = booksTestData.pickOneById(id);

        if (exists) {
          const { authorId, ...rest } = exists;
          const { authorId: updatedAuthorId, ...updatedRest } = dto;

          return {
            ...rest,
            ...updatedRest,
            author: updatedAuthorId || authorId,
          };
        }

        return;
      }),

    deleteOne: jest.fn().mockImplementation(() => Promise.resolve(undefined)),
  };
  const mockAuthorModel = {
    findById: jest.fn().mockImplementation((id: string) => {
      const exists = authorsTestData.pickOneById(id);

      if (exists) {
        return {
          ...authorsTestData.pickOneById(id),
          updateOne: jest.fn(),
        };
      }

      return exists;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: getModelToken(Book.name), useValue: mockBookModel },
        { provide: getModelToken(Author.name), useValue: mockAuthorModel },
        BooksService,
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create book', async () => {
    const book = booksTestData.randomBookData();

    const { authorId, ...rest } = book;

    const result = await service.createBook(book);

    expect(result).toEqual(
      expect.objectContaining({
        ...rest,
        author: authorId,
      }),
    );
  });

  it('should find a book', async () => {
    const book = booksTestData.pickOne();

    const result = await service.findBook(book._id);

    expect(result).toEqual(
      expect.objectContaining({
        ...book,
        __v: expect.anything(),
        _id: expect.any(String),
      }),
    );
  });

  it('should list books', async () => {
    expect(await service.listBooks()).toEqual(booksTestData.getBooks());
  });

  it('should update book', async () => {
    const update: BookUpdateDto = {
      ...booksTestData.randomBookData(),
      title: 'Abc',
    };

    const book = booksTestData.pickOne();

    const { authorId, ...rest } = book;
    const { authorId: updatedAuthorId, ...updateRest } = update;
    const expecting = {
      ...rest,
      ...updateRest,
      author: updatedAuthorId || authorId,
    };
    const result = await service.updateBook(book._id, update);

    expect(expecting).toEqual(result);
  });

  it('should update book author should not change', async () => {
    const update: BookUpdateDto = {
      ...booksTestData.randomBookData(),
      title: 'Abc',
    };

    const book = booksTestData.pickOne();

    const { authorId, ...rest } = book;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { authorId: updatedAuthorId, ...updateRest } = update;
    const expecting = {
      ...rest,
      ...updateRest,
      author: authorId,
    };
    const result = await service.updateBook(book._id, updateRest);

    expect(expecting).toEqual(result);
  });

  it('should delete book', async () => {
    const item = booksTestData.pickOne();
    expect(await service.deleteBook(item._id)).toBeUndefined();
  });

  it('should throw error when author info is wrong', async () => {
    let thrownError;
    const book = booksTestData.randomBookData();
    const newId = new mongoose.Types.ObjectId().toString();

    try {
      await service.createBook({
        ...book,
        authorId: newId,
      });
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toEqual(
      new ServerError(ServerErrorType.WAS_NOT_FOUND, 'Author', newId),
    );
  });

  it('should throw error when requested book was not found', async () => {
    let thrownError;
    const newId = new mongoose.Types.ObjectId().toString();

    try {
      await service.findBook(newId);
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toEqual(
      new ServerError(ServerErrorType.WAS_NOT_FOUND, 'Book', newId),
    );
  });
});
