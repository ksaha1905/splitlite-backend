import {
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class ParticipantDto {
  @IsString()
  userId!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amountOwed?: number;
}