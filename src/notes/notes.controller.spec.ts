import { BadRequestException } from '@nestjs/common';
import { ParseUUIDPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
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

type MockService = {
  [K in keyof NotesService]: jest.Mock;
};

const createMockService = (): MockService => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('NotesController', () => {
  let controller: NotesController;
  let service: MockService;

  beforeEach(async () => {
    service = createMockService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotesController],
      providers: [{ provide: NotesService, useValue: service }],
    }).compile();

    controller = module.get<NotesController>(NotesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should invoke notesService.create with the received DTO', async () => {
      const dto: CreateNoteDto = { title: 'New Note', content: 'Some content' };
      service.create.mockResolvedValue(mockNote);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockNote);
    });
  });

  describe('findAll', () => {
    it('should invoke notesService.findAll with undefined when no query param', async () => {
      service.findAll.mockResolvedValue([mockNote]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual([mockNote]);
    });

    it('should pass archived=true when query param is "true"', async () => {
      service.findAll.mockResolvedValue([]);

      await controller.findAll('true');

      expect(service.findAll).toHaveBeenCalledWith(true);
    });

    it('should pass archived=false when query param is "false"', async () => {
      service.findAll.mockResolvedValue([mockNote]);

      await controller.findAll('false');

      expect(service.findAll).toHaveBeenCalledWith(false);
    });

    it('should pass undefined when query param is an unrecognized value', async () => {
      service.findAll.mockResolvedValue([mockNote]);

      await controller.findAll('maybe');

      expect(service.findAll).toHaveBeenCalledWith(undefined);
    });
  });

  describe('findOne', () => {
    it('should invoke notesService.findOne with the given id', async () => {
      service.findOne.mockResolvedValue(mockNote);

      const result = await controller.findOne(mockNote.id);

      expect(service.findOne).toHaveBeenCalledWith(mockNote.id);
      expect(result).toEqual(mockNote);
    });
  });

  describe('update', () => {
    it('should invoke notesService.update with id and DTO', async () => {
      const dto: UpdateNoteDto = { title: 'Updated Title' };
      const updatedNote: Note = { ...mockNote, title: 'Updated Title' };
      service.update.mockResolvedValue(updatedNote);

      const result = await controller.update(mockNote.id, dto);

      expect(service.update).toHaveBeenCalledWith(mockNote.id, dto);
      expect(result).toEqual(updatedNote);
    });
  });

  describe('remove', () => {
    it('should invoke notesService.remove with the given id', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove(mockNote.id);

      expect(service.remove).toHaveBeenCalledWith(mockNote.id);
      expect(service.remove).toHaveBeenCalledTimes(1);
    });
  });

  describe('ParseUUIDPipe', () => {
    it('should reject invalid UUIDs with BadRequestException', async () => {
      const pipe = new ParseUUIDPipe();

      await expect(pipe.transform('not-a-uuid', { type: 'param' })).rejects.toThrow(
        BadRequestException,
      );
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
    describe('CreateNoteDto', () => {
      it('should fail when title is missing', async () => {
        const dto = plainToInstance(CreateNoteDto, { content: 'Some content' });
        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some((e) => e.property === 'title')).toBe(true);
      });

      it('should fail when content is missing', async () => {
        const dto = plainToInstance(CreateNoteDto, { title: 'Valid title' });
        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some((e) => e.property === 'content')).toBe(true);
      });

      it('should fail when title exceeds 200 characters', async () => {
        const dto = plainToInstance(CreateNoteDto, {
          title: 'a'.repeat(201),
          content: 'Valid content',
        });
        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some((e) => e.property === 'title')).toBe(true);
      });

      it('should pass with valid title and content', async () => {
        const dto = plainToInstance(CreateNoteDto, {
          title: 'Valid title',
          content: 'Valid content',
        });
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should pass with optional isArchived set to true', async () => {
        const dto = plainToInstance(CreateNoteDto, {
          title: 'Valid title',
          content: 'Valid content',
          isArchived: true,
        });
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });
    });

    describe('UpdateNoteDto', () => {
      it('should pass with an empty object (all fields optional)', async () => {
        const dto = plainToInstance(UpdateNoteDto, {});
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should fail when title exceeds 200 characters', async () => {
        const dto = plainToInstance(UpdateNoteDto, { title: 'x'.repeat(201) });
        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
      });
    });
  });
});
