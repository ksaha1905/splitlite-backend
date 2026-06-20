import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

  type SettlementSuggestion = {
  fromUserId: string;
  toUserId: string;
  amount: number;
};


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
private async getGroupSettlementData(
  groupId: string,
) {
  return this.prisma.settlement.findMany({
    where: {
      groupId,
    },

    select: {
      paidById: true,
      receivedById: true,
      amount: true,
    },
  });
}
private async getGroupBalances(
  groupId: string,
) {
  const [
    expenses,
    settlements,
  ] = await Promise.all([
    this.getGroupExpenseData(groupId),
    this.getGroupSettlementData(groupId),
  ]);

  return this.calculateBalances(
    expenses,
    settlements,
  );
}

private calculateBalances(expenses: any[], settlements: any[],) {
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
for (const settlement of settlements) {
  const amount = Number(
    settlement.amount,
  );

  balances.set(
    settlement.paidById,
    (balances.get(
      settlement.paidById,
    ) || 0) + amount,
  );

  balances.set(
    settlement.receivedById,
    (balances.get(
      settlement.receivedById,
    ) || 0) - amount,
  );
}
  return new Map(
  [...balances.entries()].map(([userId, balance]) => [
    userId,
    Math.abs(balance) < 0.01
      ? 0
      : Number(balance.toFixed(2)),
  ]),
);
}

private simplifyDebts(
  balances: Map<string, number>,
) {
  const creditors: {
    userId: string;
    amount: number;
  }[] = [];

  const debtors: {
    userId: string;
    amount: number;
  }[] = [];

  for (const [userId, balance] of balances) {
    if (balance >= 0.01) {
      creditors.push({
        userId,
        amount: balance,
      });
    }

    if (balance <= -0.01) {
      debtors.push({
        userId,
        amount: Math.abs(balance),
      });
    }
  }

  

const settlements: SettlementSuggestion[] = [];

  let creditorIndex = 0;
  let debtorIndex = 0;

  while (
    creditorIndex < creditors.length &&
    debtorIndex < debtors.length
  ) {
    const creditor =
      creditors[creditorIndex];

    const debtor =
      debtors[debtorIndex];

    const amount = Math.min(
      creditor.amount,
      debtor.amount,
    );

    settlements.push({
      fromUserId: debtor.userId,
      toUserId: creditor.userId,
      amount: Number(
        amount.toFixed(2),
      ),
    });

    creditor.amount -= amount;
    debtor.amount -= amount;

    if (creditor.amount < 0.01) {
      creditorIndex++;
    }

    if (debtor.amount < 0.01) {
      debtorIndex++;
    }
  }

  return settlements;
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

const balances =
  await this.getGroupBalances(groupId);

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
     const [
    expenseAggregate,
    expenseCount,
    memberCount,
  ] = await this.prisma.$transaction([
    this.prisma.expense.aggregate({
      where: {
        groupId,
      },

      _sum: {
        amount: true,
      },
    }),

    this.prisma.expense.count({
      where: {
        groupId,
      },
    }),

    this.prisma.groupMember.count({
      where: {
        groupId,
      },
    }),
  ]);

  return {
    totalExpenses: Number(
      expenseAggregate._sum.amount ?? 0,
    ),

    expenseCount,

    memberCount,
  };
  }

  async getSimplifiedBalances(userId: string, 
    groupId: string,
  ) {
    await this.validateGroupMembership(
    userId,
    groupId,
  );
  const balances =
  await this.getGroupBalances(groupId);

  return this.simplifyDebts(
    balances,
  );
  }
}