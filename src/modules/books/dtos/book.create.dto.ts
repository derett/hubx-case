import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class BookCreateDto {
  @IsNotEmpty()
  @IsString()
  readonly title: string;

  @IsNotEmpty()
  @IsNumber()
  readonly price: number;

  @IsNotEmpty()
  @IsString()
  readonly ISBN: string;

  @IsOptional()
  @IsString()
  readonly language?: string;

  @IsNotEmpty()
  @IsNumber()
  readonly numberOfPages: number;

  @IsOptional()
  @IsString()
  readonly publisher?: string;

  @IsMongoId()
  readonly authorId: string;
}
