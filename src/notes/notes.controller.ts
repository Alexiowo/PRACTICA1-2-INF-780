import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Note } from './entities/note.entity';

@ApiTags('notes')
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new note' })
  @ApiResponse({ status: 201, description: 'Note created successfully', type: Note })
  @ApiResponse({ status: 422, description: 'Validation error' })
  async create(@Body() createNoteDto: CreateNoteDto): Promise<Note> {
    return this.notesService.create(createNoteDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all notes, optionally filtered by archived status' })
  @ApiQuery({
    name: 'archived',
    required: false,
    type: Boolean,
    description: 'Filter notes by archived status',
  })
  @ApiResponse({ status: 200, description: 'Array of notes', type: [Note] })
  async findAll(@Query('archived') archived?: string): Promise<Note[]> {
    const archivedFilter = archived === 'true' ? true : archived === 'false' ? false : undefined;
    return this.notesService.findAll(archivedFilter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single note by UUID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Note UUID' })
  @ApiResponse({ status: 200, description: 'Note found', type: Note })
  @ApiResponse({ status: 404, description: 'Note not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Note> {
    return this.notesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Partially update a note' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Note UUID' })
  @ApiResponse({ status: 200, description: 'Note updated successfully', type: Note })
  @ApiResponse({ status: 404, description: 'Note not found' })
  @ApiResponse({ status: 422, description: 'Validation error' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateNoteDto: UpdateNoteDto,
  ): Promise<Note> {
    return this.notesService.update(id, updateNoteDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a note' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Note UUID' })
  @ApiResponse({ status: 204, description: 'Note deleted' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.notesService.remove(id);
  }
}
