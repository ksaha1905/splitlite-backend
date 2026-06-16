import {
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';

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
}
