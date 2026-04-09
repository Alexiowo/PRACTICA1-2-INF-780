import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksRepository {
  constructor(
    @InjectRepository(Book)
    private readonly repository: Repository<Book>,
  ) {}

  async create(createBookDto: CreateBookDto): Promise<Book> {
    const book = this.repository.create(createBookDto);
    return this.repository.save(book);
  }

  async findAll(isRead?: boolean): Promise<Book[]> {
    const qb = this.repository.createQueryBuilder('book');
    if (isRead !== undefined) {
      qb.where('book.isRead = :isRead', { isRead });
    }
    return qb.orderBy('book.createdAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<Book | null> {
    return this.repository.findOne({ where: { id } });
  }

  async update(id: string, updateBookDto: UpdateBookDto): Promise<Book | null> {
    await this.repository.update(id, updateBookDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
