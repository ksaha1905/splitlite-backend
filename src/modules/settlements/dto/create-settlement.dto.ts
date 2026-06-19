import {
  IsUUID,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateSettlementDto {
  @IsUUID()
  groupId!: string;

  @IsUUID()
  paidById!: string;

  @IsUUID()
  receivedById!: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
  )
  @Min(0.01)
  amount!: number;
}