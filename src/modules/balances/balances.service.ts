import { Injectable } from '@nestjs/common';

@Injectable()
export class BalancesService {
  async getBalances(groupId: string) {
    return {
      message: 'balances endpoint',
      groupId,
    };
  }

  async getGroupSummary(groupId: string) {
    return {
      message: 'summary endpoint',
      groupId,
    };
  }

  async getSimplifiedBalances(
    groupId: string,
  ) {
    return {
      message:
        'simplified balances endpoint',
      groupId,
    };
  }
}