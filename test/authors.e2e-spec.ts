import { HttpStatus, INestApplication } from '@nestjs/common';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Model } from 'mongoose';
import { AuthorsModule } from 'src/modules/authors/authors.module';
import authorsTestData from 'src/modules/authors/tests/authors.test.data';
import { Author } from 'src/schemas/author.schema';
import { ServerError, ServerErrorType } from 'src/shared/helpers/errors.helper';
import * as request from 'supertest';

describe('AuthorsController (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const dbUri = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MongooseModule.forRoot(dbUri), AuthorsModule],
    }).compile();

    const authorsModel = moduleFixture.get<Model<Author>>(
      getModelToken(Author.name),
    );

    const authors = authorsTestData.getAuthors();

    await Promise.all(authors.map((author) => authorsModel.create(author)));

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

  it('/authors (GET)', async () => {
    await request(app.getHttpServer())
      .get('/authors')
      .expect(200)
      .expect(({ body }) => {
        expect(body.length).toEqual(authorsTestData.getAuthors().length);
        authorsTestData.getAuthors().forEach((author) => {
          expect(body).toEqual(
            expect.arrayContaining([expect.objectContaining(author)]),
          );
        });
      });
  });

  it('/authors/:id (GET)', async () => {
    const pickOne = authorsTestData.pickOne();
    await request(app.getHttpServer())
      .get(`/authors/${pickOne._id}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual(expect.objectContaining(pickOne));
      });
  });

  it('/authors/:id (GET) Faulty', async () => {
    const id = new mongoose.Types.ObjectId().toString();
    await request(app.getHttpServer())
      .get(`/authors/${id}`)
      .expect(HttpStatus.NOT_FOUND)
      .expect(({ body }) => {
        expect(body.message).toEqual(
          new ServerError(ServerErrorType.WAS_NOT_FOUND, 'Author', id).message,
        );
      });
  });

  it('/authors/ (POST)', async () => {
    const newAuthor = authorsTestData.randomAuthorData();
    await request(app.getHttpServer())
      .post('/authors')
      .send(newAuthor)
      .expect(201)
      .expect(({ body }) => {
        expect(body).toEqual(
          expect.objectContaining({
            ...newAuthor,
            _id: expect.any(String),
            __v: expect.any(Number),
          }),
        );
      });
  });

  it('/authors/:id (PUT)', async () => {
    const pickOne = authorsTestData.pickOne();
    const newData = authorsTestData.randomAuthorData();
    const merged = { ...pickOne, ...newData };
    await request(app.getHttpServer())
      .put(`/authors/${pickOne._id}`)
      .send(merged)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual(expect.objectContaining(merged));
      });
  });

  it('/authors/:id (DELETE)', async () => {
    const pickOne = authorsTestData.pickOne();
    await request(app.getHttpServer())
      .delete(`/authors/${pickOne._id}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual({});
      });
  });
});
