import { Controller, Get, Param } from '@nestjs/common';
import { BalancesService } from './balances.service';

@Controller('group/:groupId')
export class BalancesController {
  constructor(
    private readonly balancesService: BalancesService,
  ) {}

  @Get('balances')
  getBalances(
    @Param('groupId') groupId: string,
  ) {
    return this.balancesService.getBalances(
      groupId,
    );
  }

  @Get('summary')
  getGroupSummary(
    @Param('groupId') groupId: string,
  ) {
    return this.balancesService.getGroupSummary(
      groupId,
    );
  }

  @Get('simplified-balances')
  getSimplifiedBalances(
    @Param('groupId') groupId: string,
  ) {
    return this.balancesService.getSimplifiedBalances(
      groupId,
    );
  }
}