import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { SettlementsService } from './settlements.service';
import { CreateSettlementDto } from './dto/create-settlement.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('settlements')
export class SettlementsController {
    constructor(
    private readonly settlementsService: SettlementsService,
  ) {}

@Post()
createSettlement(
  @CurrentUser() user: any,
  @Body() dto: CreateSettlementDto,
) {
  return this.settlementsService.createSettlement(
    user.id,
    dto,
  );
}
}
