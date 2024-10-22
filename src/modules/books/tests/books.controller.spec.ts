import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { BooksController } from '../books.controller';
import { BooksService } from '../books.service';
import { BookCreateDto } from '../dtos/book.create.dto';
import { BookUpdateDto } from '../dtos/book.update.dto';
import booksTestData from './books.test.data';

describe('BooksController', () => {
  let controller: BooksController;

  const mockService = {
    createBook: jest.fn((dto: BookCreateDto) => {
      return {
        _id: mongoose.Types.ObjectId.generate(),
        __v: 0,
        ...dto,
      };
    }),
    listBooks: jest.fn(() => booksTestData.getBooks),
    findBook: jest.fn((id: string) => booksTestData.pickOneById(id)),
    updateBook: jest.fn((id: string, dto: BookUpdateDto) => {
      return {
        ...booksTestData.pickOneById(id),
        ...dto,
      };
    }),
    deleteBook: jest.fn(() => undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [BooksService],
    })
      .overrideProvider(BooksService)
      .useValue(mockService)
      .compile();

    controller = module.get<BooksController>(BooksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should list all', async () => {
    expect(await controller.listBooks()).toEqual(booksTestData.getBooks);
  });

  it('should find one', async () => {
    const item = booksTestData.pickOne();
    expect(await controller.findBook(item._id)).toEqual(item);
  });

  it('should create one', async () => {
    const dto = booksTestData.createRandomBook();
    expect(await controller.createBook(dto)).toEqual({
      _id: expect.any(String),
      __v: expect.any(Number),
      ...dto,
    });
  });

  it('should update one', async () => {
    const item = booksTestData.pickOne();
    const newItem = booksTestData.createRandomBook();
    expect(await controller.updateBook(item._id, newItem)).toEqual({
      _id: item._id,
      __v: expect.any(Number),
      ...newItem,
    });
  });

  it('should delete one', async () => {
    const item = booksTestData.pickOne();
    expect(await controller.deleteBook(item._id)).toBeUndefined();
  });
});
