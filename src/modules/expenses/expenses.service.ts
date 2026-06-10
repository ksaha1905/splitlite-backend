import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import {
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class ExpensesService {
  constructor(
    private prisma: PrismaService,
  ) {}

  private async validateExpenseCreation(
  userId: string,
  dto: CreateExpenseDto,
) {
  const membership =
    await this.prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId: dto.groupId,
        },
      },
    });

  if (!membership) {
    throw new ForbiddenException(
      'You are not a member of this group',
    );
  }

  const uniqueParticipantIds =
    [...new Set(dto.participantIds)];

  if (
    uniqueParticipantIds.length !==
    dto.participantIds.length
  ) {
    throw new BadRequestException(
      'Duplicate participants are not allowed',
    );
  }

  const groupMembers =
    await this.prisma.groupMember.findMany({
      where: {
        groupId: dto.groupId,
      },

      select: {
        userId: true,
      },
    });

  const memberIds =
    groupMembers.map(
      (member) => member.userId,
    );

  const invalidParticipants =
    dto.participantIds.filter(
      (participantId) =>
        !memberIds.includes(participantId),
    );

  if (invalidParticipants.length > 0) {
    throw new BadRequestException(
      'Some participants are not group members',
    );
  }

  if (dto.splitType !== 'EQUAL') {
    throw new BadRequestException(
      'Only equal split supported currently',
    );
  }
}

 async createExpense(
  userId: string,
  dto: CreateExpenseDto,
) {
  await this.validateExpenseCreation(
    userId,
    dto,
  );

  const splitAmount =
    dto.amount /
    dto.participantIds.length;

  return this.prisma.expense.create({
  data: {
    title: dto.title,
    amount: dto.amount,
    splitType: dto.splitType,
    groupId: dto.groupId,
    paidById: userId,

    participants: {
      create: dto.participantIds.map(
        (participantId) => ({
          userId: participantId,
          amountOwed: splitAmount,
        }),
      ),
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
}
}