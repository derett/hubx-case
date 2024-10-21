import { PartialType } from '@nestjs/swagger';
import { BookCreateDto } from './book.create.dto';

export class BookUpdateDto extends PartialType(BookCreateDto) {}
