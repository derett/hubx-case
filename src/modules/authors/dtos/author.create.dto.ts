import { IsNotEmpty, IsString } from 'class-validator';

export class AuthorCreateDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsString()
  readonly country?: string;

  @IsString()
  readonly birthDate?: string;
}
