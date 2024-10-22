import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class BookCreateDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly title: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  readonly price: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly ISBN: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly language?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  readonly numberOfPages: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly publisher?: string;

  @ApiProperty()
  @IsMongoId()
  readonly authorId: string;
}
