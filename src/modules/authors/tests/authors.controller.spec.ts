import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { AuthorsController } from '../authors.controller';
import { AuthorsService } from '../authors.service';
import { AuthorCreateDto } from '../dtos/author.create.dto';
import { AuthorUpdateDto } from '../dtos/author.update.dto';
import authorsTestData from './authors.test.data';

describe('AuthorsController', () => {
  let controller: AuthorsController;

  const mockService = {
    createAuthor: jest.fn((dto: AuthorCreateDto) => {
      return {
        _id: mongoose.Types.ObjectId.generate(),
        __v: 0,
        ...dto,
      };
    }),
    listAuthors: jest.fn(() => authorsTestData.getAuthors),
    findAuthor: jest.fn((id: string) => authorsTestData.pickOneById(id)),
    updateAuthor: jest.fn((id: string, dto: AuthorUpdateDto) => {
      return {
        ...authorsTestData.pickOneById(id),
        ...dto,
      };
    }),
    deleteAuthor: jest.fn(() => undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthorsController],
      providers: [AuthorsService],
    })
      .overrideProvider(AuthorsService)
      .useValue(mockService)
      .compile();

    controller = module.get<AuthorsController>(AuthorsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should list all', async () => {
    expect(await controller.listAuthors()).toEqual(authorsTestData.getAuthors);
  });

  it('should find one', async () => {
    const item = authorsTestData.pickOne();
    expect(await controller.findAuthor(item._id)).toEqual(item);
  });

  it('should create one', async () => {
    const dto = authorsTestData.createRandomAuthor();
    expect(await controller.createAuthor(dto)).toEqual({
      _id: expect.any(String),
      __v: expect.any(Number),
      ...dto,
    });
  });

  it('should update one', async () => {
    const item = authorsTestData.pickOne();
    const newItem = authorsTestData.createRandomAuthor();
    expect(await controller.updateAuthor(item._id, newItem)).toEqual({
      _id: item._id,
      __v: expect.any(Number),
      ...newItem,
    });
  });

  it('should delete one', async () => {
    const item = authorsTestData.pickOne();
    expect(await controller.deleteAuthor(item._id)).toBeUndefined();
  });
});
