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

private async getGroupExpenseData(
  groupId: string,
) {
  return this.prisma.expense.findMany({
    where: {
      groupId,
    },

    select: {
      amount: true,
      paidById: true,

      participants: {
        select: {
          userId: true,
          amountOwed: true,
        },
      },
    },
  });
}
  async getBalances(
  userId: string,
  groupId: string,
) {
  await this.validateGroupMembership(
    userId,
    groupId,
  );

  const expenses =
    await this.getGroupExpenseData(
      groupId,
    );

  return expenses;
}

  async getGroupSummary(userId: string, groupId: string) {
    await this.validateGroupMembership(
    userId,
    groupId,
  );
    return {
      message: 'summary endpoint',
      groupId,
    };
  }

  async getSimplifiedBalances(userId: string, 
    groupId: string,
  ) {
    await this.validateGroupMembership(
    userId,
    groupId,
  );
    return {
      message:
        'simplified balances endpoint',
      groupId,
    };
  }
}