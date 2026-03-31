import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { NotesService } from './notes.service';
import { NotesRepository } from './notes.repository';
import { Note } from './entities/note.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

const mockNote: Note = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  title: 'Test Note',
  content: 'Test content',
  isArchived: false,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
};

type MockRepository = {
  [K in keyof NotesRepository]: jest.Mock;
};

const createMockRepository = (): MockRepository => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('NotesService', () => {
  let service: NotesService;
  let repository: MockRepository;

  beforeEach(async () => {
    repository = createMockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [NotesService, { provide: NotesRepository, useValue: repository }],
    }).compile();

    service = module.get<NotesService>(NotesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('#create', () => {
    it('should save and return the created note', async () => {
      const dto: CreateNoteDto = { title: 'Test Note', content: 'Test content' };
      repository.create.mockResolvedValue(mockNote);

      const result = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockNote);
    });
  });

  describe('#findAll', () => {
    it('should return an array of all notes when no filter is provided', async () => {
      repository.findAll.mockResolvedValue([mockNote]);

      const result = await service.findAll();

      expect(repository.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual([mockNote]);
    });

    it('should filter archived notes when archived=true', async () => {
      const archivedNote: Note = { ...mockNote, isArchived: true };
      repository.findAll.mockResolvedValue([archivedNote]);

      const result = await service.findAll(true);

      expect(repository.findAll).toHaveBeenCalledWith(true);
      expect(result).toHaveLength(1);
      expect(result[0].isArchived).toBe(true);
    });

    it('should filter non-archived notes when archived=false', async () => {
      repository.findAll.mockResolvedValue([mockNote]);

      const result = await service.findAll(false);

      expect(repository.findAll).toHaveBeenCalledWith(false);
      expect(result).toEqual([mockNote]);
    });
  });

  describe('#findOne', () => {
    it('should return the note when it exists', async () => {
      repository.findOne.mockResolvedValue(mockNote);

      const result = await service.findOne(mockNote.id);

      expect(repository.findOne).toHaveBeenCalledWith(mockNote.id);
      expect(result).toEqual(mockNote);
    });

    it('should throw NotFoundException when the note does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-uuid')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('non-existent-uuid')).rejects.toThrow(
        'Note with id "non-existent-uuid" not found',
      );
    });
  });

  describe('#update', () => {
    it('should return the updated note when it exists', async () => {
      const dto: UpdateNoteDto = { title: 'Updated Title' };
      const updatedNote: Note = { ...mockNote, title: 'Updated Title' };
      repository.findOne.mockResolvedValue(mockNote);
      repository.update.mockResolvedValue(updatedNote);

      const result = await service.update(mockNote.id, dto);

      expect(repository.update).toHaveBeenCalledWith(mockNote.id, dto);
      expect(result).toEqual(updatedNote);
    });

    it('should throw NotFoundException when the note does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent-uuid', { title: 'x' })).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('#remove', () => {
    it('should call remove exactly once with the correct id', async () => {
      repository.findOne.mockResolvedValue(mockNote);
      repository.remove.mockResolvedValue(undefined);

      await service.remove(mockNote.id);

      expect(repository.remove).toHaveBeenCalledTimes(1);
      expect(repository.remove).toHaveBeenCalledWith(mockNote.id);
    });

    it('should throw NotFoundException when the note does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-uuid')).rejects.toThrow(NotFoundException);
      expect(repository.remove).not.toHaveBeenCalled();
    });
  });
});
