import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { GetExpensesQueryDto } from './dto/get-expenses-query.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  private async validateExpenseCreation(userId: string, dto: CreateExpenseDto) {
    const membership = await this.prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId: dto.groupId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this group');
    }

    const participantIds = dto.participants.map(
      (participant) => participant.userId,
    );

    const uniqueParticipantIds = [...new Set(participantIds)];

    if (uniqueParticipantIds.length !== participantIds.length) {
      throw new BadRequestException('Duplicate participants are not allowed');
    }

    const groupMembers = await this.prisma.groupMember.findMany({
      where: {
        groupId: dto.groupId,
      },

      select: {
        userId: true,
      },
    });

    const memberIds = groupMembers.map((member) => member.userId);
    if (!memberIds.includes(dto.paidById)) {
      throw new BadRequestException('Payer must be a group member');
    }

    const invalidParticipants = participantIds.filter(
      (participantId) => !memberIds.includes(participantId),
    );

    if (invalidParticipants.length > 0) {
      throw new BadRequestException('Some participants are not group members');
    }

    if (dto.splitType !== 'EQUAL' && dto.splitType !== 'EXACT') {
      throw new BadRequestException('Invalid split type');
    }

    if (dto.splitType === 'EXACT') {
      const total = dto.participants.reduce(
        (sum, participant) => sum + participant.amountOwed!,
        0,
      );

      if (total !== dto.amount) {
        throw new BadRequestException(
          'Participant amounts must equal total expense',
        );
      }
    }
  }
  private async validateExpenseEditPermission(
  userId: string,
  expenseId: string,
) {
  const expense =
    await this.prisma.expense.findUnique({
      where: {
        id: expenseId,
      },

      select: {
        id: true,
        paidById: true,
        groupId: true,
      },
    });

  if (!expense) {
    throw new NotFoundException(
      'Expense not found',
    );
  }

  const membership =
    await this.prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId: expense.groupId,
        },
      },
    });

  if (!membership) {
    throw new ForbiddenException(
      'You are not a member of this group',
    );
  }

  const canEdit =
    expense.paidById === userId ||
    membership.role === 'OWNER';

  if (!canEdit) {
    throw new ForbiddenException(
      'You do not have permission to edit this expense',
    );
  }

  return expense;
}

  private calculateEqualSplit(totalAmount: number, participantCount: number) {
    const totalInPaise = Math.round(totalAmount * 100);

    const baseShare = Math.floor(totalInPaise / participantCount);

    const remainder = totalInPaise % participantCount;

    return Array.from(
      {
        length: participantCount,
      },
      (_, index) => (baseShare + (index < remainder ? 1 : 0)) / 100,
    );
  }

  async createExpense(userId: string, dto: CreateExpenseDto) {
    await this.validateExpenseCreation(userId, dto);

    const equalSplits =
      dto.splitType === 'EQUAL'
        ? this.calculateEqualSplit(dto.amount, dto.participants.length)
        : [];

    const participantData =
      dto.splitType === 'EQUAL'
        ? dto.participants.map((participant, index) => ({
            amountOwed: equalSplits[index],

            user: {
              connect: {
                id: participant.userId,
              },
            },
          }))
        : dto.participants.map((participant) => ({
            amountOwed: participant.amountOwed!,

            user: {
              connect: {
                id: participant.userId,
              },
            },
          }));

    return this.prisma.$transaction(async (tx) => {
      const expense = await tx.expense.create({
        data: {
          title: dto.title,
          amount: dto.amount,
          splitType: dto.splitType,
          groupId: dto.groupId,
          paidById: dto.paidById,

          participants: {
            create: participantData,
          },
        },

        select: {
          id: true,
          title: true,
          amount: true,
          splitType: true,
          groupId: true,
          paidById: true,
          createdAt: true,

          participants: {
            select: {
              userId: true,
              amountOwed: true,
            },
          },
        },
      });

      return expense;
    });
  }

async getGroupExpenses(
  userId: string,
  groupId: string,
  query: GetExpensesQueryDto,
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

  const page = query.page || 1;
  const limit = query.limit || 10;

  const skip = (page - 1) * limit;

  const whereClause = {
    groupId,

    ...(query.paidById && {
      paidById: query.paidById,
    }),

    ...(query.splitType && {
      splitType: query.splitType,
    }),

    ...(query.search && {
      title: {
        contains: query.search,
        mode: 'insensitive' as const,
      },
    }),

    ...((query.from || query.to) && {
      createdAt: {
        ...(query.from && {
          gte: new Date(query.from),
        }),

        ...(query.to && {
          lte: new Date(query.to),
        }),
      },
    }),

    ...((query.minAmount ||
      query.maxAmount) && {
      amount: {
        ...(query.minAmount && {
          gte: Number(query.minAmount),
        }),

        ...(query.maxAmount && {
          lte: Number(query.maxAmount),
        }),
      },
    }),
  };

  const [expenses, total] =
    await this.prisma.$transaction([
      this.prisma.expense.findMany({
        where: whereClause,

        skip,
        take: limit,

        orderBy: {
          createdAt: 'desc',
        },

        select: {
          id: true,
          title: true,
          amount: true,
          splitType: true,
          createdAt: true,

          paidBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),

      this.prisma.expense.count({
        where: whereClause,
      }),
    ]);

  return {
    data: expenses,

    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async getExpenseDetails(
  userId: string,
  expenseId: string,
) {
  const expense =
    await this.prisma.expense.findUnique({
      where: {
        id: expenseId,
      },

      select: {
        id: true,
        title: true,
        amount: true,
        splitType: true,
        createdAt: true,
        updatedAt: true,

        groupId: true,

        paidBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        participants: {
          select: {
            amountOwed: true,

            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

  if (!expense) {
    throw new NotFoundException(
      'Expense not found',
    );
  }

  const membership =
    await this.prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId: expense.groupId,
        },
      },
    });

  if (!membership) {
    throw new ForbiddenException(
      'You are not a member of this group',
    );
  }

  const { groupId, ...response } = expense;

return response;
}

async updateExpense(
  userId: string,
  expenseId: string,
  dto: UpdateExpenseDto,
) {
  await this.validateExpenseEditPermission(
    userId,
    expenseId,
  );

  await this.validateExpenseCreation(
    userId,
    dto,
  );

  const equalSplits =
    dto.splitType === 'EQUAL'
      ? this.calculateEqualSplit(
          dto.amount,
          dto.participants.length,
        )
      : [];

  const participantData =
    dto.splitType === 'EQUAL'
      ? dto.participants.map(
          (participant, index) => ({
            amountOwed:
              equalSplits[index],

            user: {
              connect: {
                id: participant.userId,
              },
            },
          }),
        )
      : dto.participants.map(
          (participant) => ({
            amountOwed:
              participant.amountOwed!,

            user: {
              connect: {
                id: participant.userId,
              },
            },
          }),
        );

  return this.prisma.$transaction(
    async (tx) => {
      await tx.expenseParticipant.deleteMany(
        {
          where: {
            expenseId,
          },
        },
      );

      const expense =
        await tx.expense.update({
          where: {
            id: expenseId,
          },

          data: {
            title: dto.title,
            amount: dto.amount,
            splitType:
              dto.splitType,
            paidById:
              dto.paidById,

            participants: {
              create:
                participantData,
            },
          },

          select: {
            id: true,
            title: true,
            amount: true,
            splitType: true,
            paidById: true,
            updatedAt: true,
          },
        });

      return expense;
    },
  );
}

async deleteExpense(
  userId: string,
  expenseId: string,
) {
  await this.validateExpenseEditPermission(
    userId,
    expenseId,
  );

  await this.prisma.expense.delete({
    where: {
      id: expenseId,
    },
  });

  return {
    message: 'Expense deleted successfully',
  };
}
}
