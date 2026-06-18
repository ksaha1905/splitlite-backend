import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BalancesService {

     constructor(
    private prisma: PrismaService,
  ) {}

  private async validateGroupMembership(
  userId: string,
  groupId: string,
) {
  const membership =
    await this.prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });

  if (!membership) {
    throw new ForbiddenException(
      'You are not a member of this group',
    );
  }

  return membership;
}

  async getBalances(userId: string, groupId: string) {
    return {
      message: 'balances endpoint',
      groupId,
    };
  }

  async getGroupSummary(userId: string, groupId: string) {
    return {
      message: 'summary endpoint',
      groupId,
    };
  }

  async getSimplifiedBalances(userId: string, 
    groupId: string,
  ) {
    return {
      message:
        'simplified balances endpoint',
      groupId,
    };
  }
}