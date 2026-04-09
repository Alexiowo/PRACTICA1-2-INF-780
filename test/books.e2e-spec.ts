import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import request from 'supertest';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';
import { Book } from '../src/books/entities/book.entity';
import { BooksModule } from '../src/books/books.module';

describe('Books (e2e)', () => {
  let app: INestApplication;
  let createdBookId: string;

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
            dropSchema: false,
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

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  
  describe('POST /books', () => {
    it('should create a book and return 201 with correct body', async () => {
      const response = await request(app.getHttpServer())
        .post('/books')
        .send({
          title: "E2E Test Book",
          author: "Test Author"
        })
        .expect(201);

      expect(response.body.statusCode).toBe(201);
      expect(response.body.data).toMatchObject({
        title: "E2E Test Book",
        author: "Test Author",
        isRead: false,
      });
      expect(response.body.data.id).toBeDefined();
      createdBookId = response.body.data.id;
    });

    it('should return 422 when title is missing', async () => {
      await request(app.getHttpServer())
        .post('/books')
        .send({ author: "Author Only" })
        .expect(422);
    });

    it('should return 422 when title exceeds 200 characters', async () => {
      await request(app.getHttpServer())
        .post('/books')
        .send({ title: 'a'.repeat(201), author: "Author" })
        .expect(422);
    });
  });

  
  describe('GET /books', () => {
    it('should return 200 with an array containing the created book', async () => {
      const response = await request(app.getHttpServer())
        .get('/books')
        .expect(200);

      expect(response.body.statusCode).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);

      const found = response.body.data.find((b: Book) => b.id === createdBookId);
      expect(found).toBeDefined();
      expect(found.title).toBe('E2E Test Book');
    });
  });

  
  describe('GET /books/:id', () => {
    it('should return 200 with the correct book data', async () => {
      const response = await request(app.getHttpServer())
        .get(`/books/${createdBookId}`)
        .expect(200);

      expect(response.body.data.id).toBe(createdBookId);
      expect(response.body.data.title).toBe('E2E Test Book');
    });

    it('should return 404 when book does not exist', async () => {
      await request(app.getHttpServer())
        .get('/books/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });

    it('should return 400 when UUID is invalid', async () => {
      await request(app.getHttpServer())
        .get('/books/not-a-uuid')
        .expect(400);
    });
  });

  
  describe('PATCH /books/:id', () => {
    it('should return 200 with the updated field', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/books/${createdBookId}`)
        .send({ title: 'Updated E2E Title' })
        .expect(200);

      expect(response.body.data.title).toBe('Updated E2E Title');
    });

    it('should return 404 when book does not exist', async () => {
      await request(app.getHttpServer())
        .patch('/books/00000000-0000-0000-0000-000000000000')
        .send({ title: 'Ghost Book' })
        .expect(404);
    });
  });


  describe('DELETE /books/:id', () => {
    it('should return 204 with no body', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/books/${createdBookId}`)
        .expect(204);

      expect(response.body).toEqual({});
    });

    it('should return 404 when book does not exist', async () => {
      await request(app.getHttpServer())
        .delete('/books/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

 
  describe('GET /books/:id (after deletion)', () => {
    it('should return 404 for the deleted book', async () => {
      await request(app.getHttpServer())
        .get(`/books/${createdBookId}`)
        .expect(404);
    });
  });
});
