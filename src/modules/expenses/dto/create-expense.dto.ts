import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Min,
  ArrayMinSize,
} from 'class-validator';

export enum SplitType {
  EQUAL = 'EQUAL',
  EXACT = 'EXACT',
}

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsNumber()
  @Min(1)
  amount!: number;

  @IsUUID()
  groupId!: string;

  @IsEnum(SplitType)
  splitType!: SplitType;

  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  participantIds!: string[];
}