import {
  IsEnum,
  IsOptional,
  IsString,
  IsNumberString,
} from 'class-validator';

import { SplitType } from '@prisma/client';

export class GetExpensesQueryDto {
  @IsOptional()
  @IsString()
  paidById?: string;

  @IsOptional()
  @IsEnum(SplitType)
  splitType?: SplitType;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @IsNumberString()
  minAmount?: string;

  @IsOptional()
  @IsNumberString()
  maxAmount?: string;
}