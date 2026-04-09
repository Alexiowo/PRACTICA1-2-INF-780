import { BadRequestException } from '@nestjs/common';
import { ParseUUIDPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { Book } from './entities/book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

const mockBook: Book = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  title: 'Test Book',
  author: 'Test Author',
  isRead: false,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
};

type MockService = {
  [K in keyof BooksService]: jest.Mock;
};

const createMockService = (): MockService => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('BooksController', () => {
  let controller: BooksController;
  let service: MockService;

  beforeEach(async () => {
    service = createMockService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [{ provide: BooksService, useValue: service }],
    }).compile();

    controller = module.get<BooksController>(BooksController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should invoke booksService.create with the received DTO', async () => {
      const dto: CreateBookDto = { title: 'New Book', author: 'Some Author' };
      service.create.mockResolvedValue(mockBook);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockBook);
    });
  });

  describe('findAll', () => {
    it('should invoke booksService.findAll with undefined when no query param', async () => {
      service.findAll.mockResolvedValue([mockBook]);
      const result = await controller.findAll();
      expect(service.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual([mockBook]);
    });

    it('should pass isRead=true when query param is "true"', async () => {
      service.findAll.mockResolvedValue([]);
      await controller.findAll('true');
      expect(service.findAll).toHaveBeenCalledWith(true);
    });

    it('should pass isRead=false when query param is "false"', async () => {
      service.findAll.mockResolvedValue([mockBook]);
      await controller.findAll('false');
      expect(service.findAll).toHaveBeenCalledWith(false);
    });

    it('should pass undefined when query param is an unrecognized value', async () => {
      service.findAll.mockResolvedValue([mockBook]);
      await controller.findAll('maybe');
      expect(service.findAll).toHaveBeenCalledWith(undefined);
    });
  });

  describe('findOne', () => {
    it('should invoke booksService.findOne with the given id', async () => {
      service.findOne.mockResolvedValue(mockBook);
      const result = await controller.findOne(mockBook.id);
      expect(service.findOne).toHaveBeenCalledWith(mockBook.id);
      expect(result).toEqual(mockBook);
    });
  });

  describe('update', () => {
    it('should invoke booksService.update with id and DTO', async () => {
      const dto: UpdateBookDto = { title: 'Updated Title' };
      const updatedBook: Book = { ...mockBook, title: 'Updated Title' };
      service.update.mockResolvedValue(updatedBook);
      const result = await controller.update(mockBook.id, dto);
      expect(service.update).toHaveBeenCalledWith(mockBook.id, dto);
      expect(result).toEqual(updatedBook);
    });
  });

  describe('remove', () => {
    it('should invoke booksService.remove with the given id', async () => {
      service.remove.mockResolvedValue(undefined);
      await controller.remove(mockBook.id);
      expect(service.remove).toHaveBeenCalledWith(mockBook.id);
      expect(service.remove).toHaveBeenCalledTimes(1);
    });
  });

  describe('ParseUUIDPipe', () => {
    it('should reject invalid UUIDs with BadRequestException', async () => {
      const pipe = new ParseUUIDPipe();
      await expect(pipe.transform('not-a-uuid', { type: 'param' })).rejects.toThrow(BadRequestException);
    });

    it('should accept and return a valid UUID v4', async () => {
      const pipe = new ParseUUIDPipe();
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const result = await pipe.transform(validUuid, { type: 'param' });
      expect(result).toBe(validUuid);
    });

    it('should reject an empty string', async () => {
      const pipe = new ParseUUIDPipe();
      await expect(pipe.transform('', { type: 'param' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('DTO validation', () => {
    describe('CreateBookDto', () => {
      it('should fail when title is missing', async () => {
        const dto = plainToInstance(CreateBookDto, { author: 'Some Author' });
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some((e) => e.property === 'title')).toBe(true);
      });

      it('should fail when author is missing', async () => {
        const dto = plainToInstance(CreateBookDto, { title: 'Valid title' });
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some((e) => e.property === 'author')).toBe(true);
      });

      it('should fail when title exceeds 200 characters', async () => {
        const dto = plainToInstance(CreateBookDto, {
          title: 'a'.repeat(201),
          author: 'Valid Author',
        });
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some((e) => e.property === 'title')).toBe(true);
      });

      it('should pass with valid title and author', async () => {
        const dto = plainToInstance(CreateBookDto, {
          title: 'Valid title',
          author: 'Valid Author',
        });
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      });
    });

    describe('UpdateBookDto', () => {
      it('should pass with an empty object (all fields optional)', async () => {
        const dto = plainToInstance(UpdateBookDto, {});
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      });

      it('should fail when title exceeds 200 characters', async () => {
        const dto = plainToInstance(UpdateBookDto, { title: 'x'.repeat(201) });
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
      });
    });
  });
});
