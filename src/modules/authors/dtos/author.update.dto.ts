import { PartialType } from '@nestjs/swagger';
import { AuthorCreateDto } from './author.create.dto';

export class AuthorUpdateDto extends PartialType(AuthorCreateDto) {}
