import {
  IsEnum,
  IsOptional,
  IsString,
  IsNumberString,
  Min,
  Max
} from 'class-validator';
import { Type } from 'class-transformer';

import { SplitType } from '@prisma/client';

export class GetExpensesQueryDto {

@IsOptional()
@Type(() => Number)
@Min(1)
page?: number = 1;

@IsOptional()
@Type(() => Number)
@Min(1)
@Max(100)
limit?: number = 10;

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