import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import * as Joi from 'joi';
import request from 'supertest';
import { Repository } from 'typeorm';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';
import { Book } from '../src/books/entities/book.entity';
import { BooksModule } from '../src/books/books.module';

describe('Books (e2e)', () => {
  let app: INestApplication;
  let createdBookId: string;
  let repo: Repository<Book>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ['.env.test', '.env'],
          validationSchema: Joi.object({
            DB_HOST: Joi.string().default('localhost'),
            DB_PORT: Joi.number().default(5432),
            DB_USER: Joi.string().required(),
            DB_PASSWORD: Joi.string().required(),
            DB_NAME: Joi.string().required(),
            NODE_ENV: Joi.string().valid('development', 'production', 'test').default('test'),
          }),
        }),
        TypeOrmModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (config: ConfigService) => ({
            type: 'postgres',
            host: config.get<string>('DB_HOST', 'localhost'),
            port: config.get<number>('DB_PORT', 5432),
            username: config.get<string>('DB_USER'),
            password: config.get<string>('DB_PASSWORD'),
            database: config.get<string>('DB_NAME'),
            entities: [Book],
            synchronize: true,
          }),
        }),
        BooksModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        errorHttpStatusCode: 422,
      }),
    );

    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new ResponseInterceptor());

    repo = moduleFixture.get<Repository<Book>>(getRepositoryToken(Book));

    await app.init();
  });

  // 🔥 LIMPIAR BD (IMPORTANTE)
  beforeEach(async () => {
    await repo.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  // POST 
  describe('POST /books', () => {
    it('should create a book (201)', async () => {
      const res = await request(app.getHttpServer())
        .post('/books')
        .send({ title: "E2E Book", author: "Author" })
        .expect(201);

      createdBookId = res.body.data.id;
    });

    it('should fail without title (422)', async () => {
      await request(app.getHttpServer())
        .post('/books')
        .send({ author: "Only Author" })
        .expect(422);
    });

    it('should fail without author (422)', async () => {
      await request(app.getHttpServer())
        .post('/books')
        .send({ title: "Only Title" })
        .expect(422);
    });

    it('should fail with long title (422)', async () => {
      await request(app.getHttpServer())
        .post('/books')
        .send({ title: 'a'.repeat(201), author: "Author" })
        .expect(422);
    });

    it('should fail with negative pages (422)', async () => {
      await request(app.getHttpServer())
        .post('/books')
        .send({ title: "Book", author: "Author", pages: -10 })
        .expect(422);
    });
  });

  // GET ALL 
  describe('GET /books', () => {
    it('should return empty array (200)', async () => {
      const res = await request(app.getHttpServer())
        .get('/books')
        .expect(200);

      expect(res.body.data).toEqual([]);
    });

    it('should return books when exist (200)', async () => {
      const book = await repo.save({ title: "Test", author: "Author" });

      const res = await request(app.getHttpServer())
        .get('/books')
        .expect(200);

      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].id).toBe(book.id);
    });
  });

  // GET  ID
  describe('GET /books/:id', () => {
    it('should return book (200)', async () => {
      const book = await repo.save({ title: "Test", author: "Author" });

      const res = await request(app.getHttpServer())
        .get(`/books/${book.id}`)
        .expect(200);

      expect(res.body.data.id).toBe(book.id);
    });

    it('should return 404 if not found', async () => {
      await request(app.getHttpServer())
        .get('/books/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });

    it('should return 400 for invalid UUID', async () => {
      await request(app.getHttpServer())
        .get('/books/invalid-id')
        .expect(400);
    });
  });

  // PATCH 
  describe('PATCH /books/:id', () => {
    it('should update book (200)', async () => {
      const book = await repo.save({ title: "Test", author: "Author" });

      const res = await request(app.getHttpServer())
        .patch(`/books/${book.id}`)
        .send({ title: "Updated" })
        .expect(200);

      expect(res.body.data.title).toBe("Updated");
    });

    it('should return 404 if not found', async () => {
      await request(app.getHttpServer())
        .patch('/books/00000000-0000-0000-0000-000000000000')
        .send({ title: "Ghost" })
        .expect(404);
    });

    it('should fail with invalid data (422)', async () => {
      const book = await repo.save({ title: "Test", author: "Author" });

      await request(app.getHttpServer())
        .patch(`/books/${book.id}`)
        .send({ pages: -5 })
        .expect(422);
    });
  });

  // DELETE
  describe('DELETE /books/:id', () => {
    it('should delete book (204)', async () => {
      const book = await repo.save({ title: "Test", author: "Author" });

      await request(app.getHttpServer())
        .delete(`/books/${book.id}`)
        .expect(204);
    });

    it('should return 404 if not found', async () => {
      await request(app.getHttpServer())
        .delete('/books/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  
  it('should complete full flow', async () => {
    const create = await request(app.getHttpServer())
      .post('/books')
      .send({ title: "Flow", author: "Flow Author" });

    const id = create.body.data.id;

    await request(app.getHttpServer())
      .get(`/books/${id}`)
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/books/${id}`)
      .send({ title: "Updated Flow" })
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/books/${id}`)
      .expect(204);

    await request(app.getHttpServer())
      .get(`/books/${id}`)
      .expect(404);
  });
});