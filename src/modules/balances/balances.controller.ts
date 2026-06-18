import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { BalancesService } from './balances.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('groups/:groupId')
@UseGuards(AuthGuard)
export class BalancesController {
  constructor(
    private readonly balancesService: BalancesService,
  ) {}

  @Get('balances')
  getBalances(
    @CurrentUser() user: any,
    @Param('groupId') groupId: string,
  ) {
    return this.balancesService.getBalances(
      user.id, groupId,
    );
  }

  @Get('summary')
  getGroupSummary(
    @CurrentUser() user: any,
    @Param('groupId') groupId: string,
  ) {
    return this.balancesService.getGroupSummary(
      user.id, groupId,
    );
  }

  @Get('simplified-balances')
  getSimplifiedBalances(
    @CurrentUser() user: any,
    @Param('groupId') groupId: string,
  ) {
    return this.balancesService.getSimplifiedBalances(
      user.id, groupId,
    );
  }
}