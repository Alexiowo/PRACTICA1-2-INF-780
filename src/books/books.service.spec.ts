import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { BooksRepository } from './books.repository';
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

type MockRepository = {
  [K in keyof BooksRepository]: jest.Mock;
};

const createMockRepository = (): MockRepository => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('BooksService', () => {
  let service: BooksService;
  let repository: MockRepository;

  beforeEach(async () => {
    repository = createMockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [BooksService, { provide: BooksRepository, useValue: repository }],
    }).compile();

    service = module.get<BooksService>(BooksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('#create', () => {
    it('should save and return the created book', async () => {
      const dto: CreateBookDto = { title: 'Test Book', author: 'Test Author' };
      repository.create.mockResolvedValue(mockBook);

      const result = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockBook);
    });
  });

  describe('#findAll', () => {
    it('should return all books when no filter is provided', async () => {
      repository.findAll.mockResolvedValue([mockBook]);

      const result = await service.findAll();

      expect(repository.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual([mockBook]);
    });

    it('should filter read books when isRead=true', async () => {
      const readBook: Book = { ...mockBook, isRead: true };
      repository.findAll.mockResolvedValue([readBook]);

      const result = await service.findAll(true);

      expect(repository.findAll).toHaveBeenCalledWith(true);
      expect(result[0].isRead).toBe(true);
    });

    it('should filter unread books when isRead=false', async () => {
      repository.findAll.mockResolvedValue([mockBook]);

      const result = await service.findAll(false);

      expect(repository.findAll).toHaveBeenCalledWith(false);
      expect(result).toEqual([mockBook]);
    });
  });

  describe('#findOne', () => {
    it('should return the book when it exists', async () => {
      repository.findOne.mockResolvedValue(mockBook);

      const result = await service.findOne(mockBook.id);

      expect(repository.findOne).toHaveBeenCalledWith(mockBook.id);
      expect(result).toEqual(mockBook);
    });

    it('should throw NotFoundException when the book does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-uuid')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('non-existent-uuid')).rejects.toThrow(
        'Book with id "non-existent-uuid" not found',
      );
    });
  });

  describe('#update', () => {
    it('should return the updated book when it exists', async () => {
      const dto: UpdateBookDto = { title: 'Updated Title' };
      const updatedBook: Book = { ...mockBook, title: 'Updated Title' };
      repository.findOne.mockResolvedValue(mockBook);
      repository.update.mockResolvedValue(updatedBook);

      const result = await service.update(mockBook.id, dto);

      expect(repository.update).toHaveBeenCalledWith(mockBook.id, dto);
      expect(result).toEqual(updatedBook);
    });

    it('should throw NotFoundException when the book does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent-uuid', { title: 'x' })).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when update fails after findOne', async () => {
      repository.findOne.mockResolvedValue(mockBook);
      repository.update.mockResolvedValue(null);

      await expect(service.update(mockBook.id, { title: 'New' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('#remove', () => {
    it('should call remove exactly once with the correct id', async () => {
      repository.findOne.mockResolvedValue(mockBook);
      repository.remove.mockResolvedValue(undefined);

      await service.remove(mockBook.id);

      expect(repository.remove).toHaveBeenCalledTimes(1);
      expect(repository.remove).toHaveBeenCalledWith(mockBook.id);
    });

    it('should throw NotFoundException when the book does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-uuid')).rejects.toThrow(NotFoundException);
      expect(repository.remove).not.toHaveBeenCalled();
    });
  });
});
