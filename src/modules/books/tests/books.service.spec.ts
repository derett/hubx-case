import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import authorsTestData from 'src/modules/authors/tests/authors.test.data';
import { Author } from 'src/schemas/author.schema';
import { Book } from 'src/schemas/book.schema';
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
      return {
        ...booksTestData.pickOneById(id),
      };
    }),
    find: jest.fn().mockResolvedValue(booksTestData.getBooks()),
    findOne: jest.fn().mockImplementation((props: { _id: string }) => {
      return {
        ...booksTestData.pickOneById(props._id),
        exec: jest
          .fn()
          .mockResolvedValue({ ...booksTestData.pickOneById(props._id) }),
      };
    }),
    updateOne: jest.fn(),
    deleteOne: jest.fn().mockImplementation(() => Promise.resolve(undefined)),
  };
  const mockAuthorModel = {
    findById: jest.fn().mockImplementation((id: string) => {
      return {
        ...authorsTestData.pickOneById(id),
        updateOne: jest.fn(),
      };
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

    expect(await service.updateBook(book._id, update)).toEqual(
      expect.objectContaining(book),
    );
  });

  it('should delete book', async () => {
    const item = booksTestData.pickOne();
    expect(await service.deleteBook(item._id)).toBeUndefined();
  });
});
