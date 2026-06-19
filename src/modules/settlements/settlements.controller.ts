import { Controller, Post, Get, Body, UseGuards, Param, Query } from '@nestjs/common';
import { SettlementsService } from './settlements.service';
import { CreateSettlementDto } from './dto/create-settlement.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';
import { GetSettlementsQueryDto } from './dto/get-settlements-query.dto';

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


@Get('/groups/:groupId')
getGroupSettlements(
  @CurrentUser() user: any,
  @Param('groupId') groupId: string,
  @Query() query: GetSettlementsQueryDto,
) {
  return this.settlementsService.getGroupSettlements(
    user.id,
    groupId,
    query,
  );
}
}
