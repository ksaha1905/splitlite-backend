import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';
import { SplitType } from '@prisma/client';
import { ParticipantDto } from './participant.dto';

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsNumber()
  amount!: number;

  @IsEnum(SplitType)
  splitType!: SplitType;

  @IsString()
  groupId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParticipantDto)
  participants!: ParticipantDto[];
}