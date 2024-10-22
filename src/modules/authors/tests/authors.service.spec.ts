import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { Author } from 'src/schemas/author.schema';
import { AuthorsService } from '../authors.service';
import { AuthorCreateDto } from '../dtos/author.create.dto';
import { AuthorUpdateDto } from '../dtos/author.update.dto';
import authorsTestData from './authors.test.data';

describe('AuthorsService', () => {
  let service: AuthorsService;
  const mockModel = {
    create: jest.fn().mockImplementation((dto: AuthorCreateDto) => {
      return {
        _id: new mongoose.Types.ObjectId().toString(),
        __v: 0,
        ...dto,
      };
    }),
    findById: jest.fn().mockImplementation((id: string) => {
      return {
        ...authorsTestData.pickOneById(id),
        populate: jest.fn().mockReturnValue(authorsTestData.populateBooks(id)),
      };
    }),
    find: jest.fn().mockResolvedValue(authorsTestData.getAuthors()),
    findByIdAndUpdate: jest
      .fn()
      .mockImplementation((id: string, dto: AuthorUpdateDto) => {
        return {
          ...authorsTestData.pickOneById(id),
          ...dto,
        };
      }),
    deleteOne: jest.fn().mockImplementation(() => Promise.resolve(undefined)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getModelToken(Author.name),
          useValue: mockModel,
        },
        AuthorsService,
      ],
    }).compile();

    service = module.get<AuthorsService>(AuthorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create author', async () => {
    const author = authorsTestData.randomAuthorData();

    const result = await service.createAuthor(author);

    expect(result).toEqual({
      _id: expect.any(String),
      __v: expect.any(Number),
      ...author,
    });
  });

  it('should find an author', async () => {
    const author = authorsTestData.pickOne();

    const result = await service.findAuthor(author._id);

    if (result.books.length) {
      expect(result).toEqual(
        expect.objectContaining({
          ...author,
          books: expect.arrayContaining([
            expect.objectContaining({
              title: expect.any(String),
            }),
          ]),
        }),
      );
    } else {
      expect(result).toEqual(
        expect.objectContaining({
          ...author,
          books: [],
        }),
      );
    }
  });

  it('should list authors', async () => {
    expect(await service.listAuthors()).toEqual(authorsTestData.getAuthors());
  });

  it('should update author', async () => {
    const update: AuthorUpdateDto = {
      ...authorsTestData.randomAuthorData(),
      name: 'Abc',
    };

    const author = authorsTestData.pickOne();

    expect(await service.updateAuthor(author._id, update)).toEqual(
      expect.objectContaining({ ...author, ...update }),
    );
  });

  it('should delete author', async () => {
    const item = authorsTestData.pickOne();
    expect(await service.deleteAuthor(item._id)).toBeUndefined();
  });
});
