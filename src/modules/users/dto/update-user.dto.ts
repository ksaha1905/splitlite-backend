import {
  IsOptional,
  IsString,
  MaxLength,
  IsUrl,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
}