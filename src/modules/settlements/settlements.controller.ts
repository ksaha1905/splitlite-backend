import { Controller, Post, Body } from '@nestjs/common';
import { SettlementsService } from './settlements.service';
import { CreateSettlementDto } from './dto/create-settlement.dto';

@Controller('settlements')
export class SettlementsController {
    constructor(
    private readonly settlementsService: SettlementsService,
  ) {}

  @Post()
createSettlement(
  @Body() dto: CreateSettlementDto,
) {
  return dto;
}
}
