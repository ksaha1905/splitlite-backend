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

private calculateBalances(expenses: any[]) {
  const balances = new Map<string, number>();

  for (const expense of expenses) {
    const amount = Number(expense.amount);

    balances.set(
      expense.paidById,
      (balances.get(expense.paidById) || 0) +
        amount,
    );

    for (const participant of expense.participants) {
      const owed = Number(
        participant.amountOwed,
      );

      balances.set(
        participant.userId,
        (balances.get(participant.userId) ||
          0) - owed,
      );
    }
  }

  return new Map(
  [...balances.entries()].map(
    ([userId, balance]) => [
      userId,
      Number(balance.toFixed(2)),
    ],
  ),
);
}

private async getGroupMembers(
  groupId: string,
) {
  return this.prisma.groupMember.findMany({
    where: {
      groupId,
    },

    select: {
      user: {
        select: {
          id: true,
          name: true,
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

  const balances =
    this.calculateBalances(expenses);

  const members =
    await this.getGroupMembers(
      groupId,
    );

  return members.map((member) => ({
    userId: member.user.id,
    name: member.user.name,
    balance:
      balances.get(member.user.id) || 0,
  })).sort((a, b) =>
      b.balance - a.balance,);
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