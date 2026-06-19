import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSettlementDto } from './dto/create-settlement.dto';

@Injectable()
export class SettlementsService {
  constructor(private prisma: PrismaService) {}

  private async validateSettlementCreation(
    userId: string,
    dto: CreateSettlementDto,
  ) {
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

    if (dto.paidById === dto.receivedById) {
      throw new BadRequestException('Cannot settle with yourself');
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

    if (!memberIds.includes(dto.receivedById)) {
      throw new BadRequestException('Receiver must be a group member');
    }
  }

  async createSettlement(
  userId: string,
  dto: CreateSettlementDto,
) {
  await this.validateSettlementCreation(
    userId,
    dto,
  );

  return this.prisma.settlement.create({
    data: {
      groupId: dto.groupId,
      paidById: dto.paidById,
      receivedById: dto.receivedById,
      amount: dto.amount,
    },

    select: {
      id: true,
      amount: true,
      createdAt: true,

      groupId: true,

      paidBy: {
        select: {
          id: true,
          name: true,
        },
      },

      receivedBy: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}
}
