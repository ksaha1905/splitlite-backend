import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSettlementDto } from './dto/create-settlement.dto';
import { GetSettlementsQueryDto } from './dto/get-settlements-query.dto';

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

async getGroupSettlements(
  userId: string,
  groupId: string,
  query: GetSettlementsQueryDto,
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
const [settlements, total] =
  await this.prisma.$transaction([
    this.prisma.settlement.findMany({
      where: {
        groupId,
      },

      skip,
      take: limit,

      orderBy: {
        createdAt: 'desc',
      },

      select: {
        id: true,
        amount: true,
        createdAt: true,

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
    }),

    this.prisma.settlement.count({
      where: {
        groupId,
      },
    }),
  ]);
  return {
  data: settlements,

  meta: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  },
};
}
}
