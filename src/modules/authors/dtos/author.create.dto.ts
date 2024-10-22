import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AuthorCreateDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly birthDate?: string;
}
