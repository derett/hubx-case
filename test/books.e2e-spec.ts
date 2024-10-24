import { HttpStatus, INestApplication } from '@nestjs/common';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Model } from 'mongoose';
import authorsTestData from 'src/modules/authors/tests/authors.test.data';
import { BooksModule } from 'src/modules/books/books.module';
import booksTestData from 'src/modules/books/tests/books.test.data';
import { Author } from 'src/schemas/author.schema';
import { Book } from 'src/schemas/book.schema';
import { ServerError, ServerErrorType } from 'src/shared/helpers/errors.helper';
import * as request from 'supertest';

describe('AuthorsController (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const dbUri = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MongooseModule.forRoot(dbUri), BooksModule],
    }).compile();

    const authorsModel = moduleFixture.get<Model<Author>>(
      getModelToken(Author.name),
    );
    const booksModel = moduleFixture.get<Model<Book>>(getModelToken(Book.name));

    const authors = authorsTestData.getAuthors();
    const books = booksTestData.getBooks();

    await Promise.all(authors.map((author) => authorsModel.create(author)));
    await Promise.all(
      books.map(({ authorId, ...rest }) =>
        booksModel.create({ ...rest, author: authorId }),
      ),
    );

    app = moduleFixture.createNestApplication<NestExpressApplication>({
      logger: false, // Set as false to suppress already expected errors. In case of debugging this can be changed to true
    });
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }

    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  it('/books (GET)', async () => {
    await request(app.getHttpServer())
      .get('/books')
      .expect(200)
      .expect(({ body }) => {
        expect(body.length).toEqual(booksTestData.getBooks().length);
        booksTestData.getBooks().forEach(({ authorId, ...rest }) => {
          expect(body).toEqual(
            expect.arrayContaining([
              expect.objectContaining({ ...rest, author: authorId }),
            ]),
          );
        });
      });
  });

  it('/books/:id (GET)', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { authorId, ...rest } = booksTestData.pickOne();
    await request(app.getHttpServer())
      .get(`/books/${rest._id}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual(expect.objectContaining({ ...rest }));
      });
  });

  it('/books/:id (GET) Faulty', async () => {
    const id = new mongoose.Types.ObjectId().toString();
    await request(app.getHttpServer())
      .get(`/books/${id}`)
      .expect(HttpStatus.NOT_FOUND)
      .expect(({ body }) => {
        expect(body.message).toEqual(
          new ServerError(ServerErrorType.WAS_NOT_FOUND, 'Book', id).message,
        );
      });
  });

  it('/books/ (POST)', async () => {
    const newBook = booksTestData.randomBookData();
    const { authorId, ...rest } = newBook;
    await request(app.getHttpServer())
      .post('/books')
      .send(newBook)
      .expect(201)
      .expect(({ body }) => {
        expect(body).toEqual(
          expect.objectContaining({
            ...rest,
            author: authorId,
            _id: expect.any(String),
            __v: expect.any(Number),
          }),
        );
      });
  });

  it('/books/ (POST) Duplicate Key Violation', async () => {
    const newBook = booksTestData.pickOne();
    await request(app.getHttpServer())
      .post('/books')
      .send(newBook)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/books/ (POST) Faulty', async () => {
    const newBook = booksTestData.randomBookData();
    const faultyId = new mongoose.Types.ObjectId().toString();
    await request(app.getHttpServer())
      .post('/books')
      .send({ ...newBook, authorId: faultyId })
      .expect(HttpStatus.NOT_FOUND)
      .expect(({ body }) => {
        expect(body.message).toEqual(
          new ServerError(ServerErrorType.WAS_NOT_FOUND, 'Author', faultyId)
            .message,
        );
      });
  });

  it('/books/:id (PUT)', async () => {
    const pickOne = booksTestData.pickOne();
    const newData = booksTestData.randomBookData();
    const merged = { ...pickOne, ...newData };
    const { authorId, ...rest } = merged;
    await request(app.getHttpServer())
      .put(`/books/${pickOne._id}`)
      .send(merged)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual(
          expect.objectContaining({ ...rest, author: authorId }),
        );
      });
  });

  it('/books/:id (PUT) Faulty', async () => {
    const pickOne = booksTestData.pickOne();
    const newData = booksTestData.randomBookData();
    const faultyId = new mongoose.Types.ObjectId().toString();
    const merged = { ...pickOne, ...newData };
    await request(app.getHttpServer())
      .put(`/books/${faultyId}`)
      .send(merged)
      .expect(HttpStatus.NOT_FOUND)
      .expect(({ body }) => {
        expect(body.message).toEqual(
          new ServerError(ServerErrorType.WAS_NOT_FOUND, 'Book', faultyId)
            .message,
        );
      });
  });

  it('/books/:id (PUT) Faulty', async () => {
    const pickOne = booksTestData.pickOne();
    const newData = booksTestData.randomBookData();
    const faultyId = new mongoose.Types.ObjectId().toString();
    const merged = { ...pickOne, ...newData, authorId: faultyId };
    await request(app.getHttpServer())
      .put(`/books/${pickOne._id}`)
      .send(merged)
      .expect(HttpStatus.NOT_FOUND)
      .expect(({ body }) => {
        expect(body.message).toEqual(
          new ServerError(ServerErrorType.WAS_NOT_FOUND, 'Author', faultyId)
            .message,
        );
      });
  });

  it('/books/:id (DELETE)', async () => {
    const pickOne = booksTestData.pickOne();
    await request(app.getHttpServer())
      .delete(`/books/${pickOne._id}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual({});
      });
  });
});
