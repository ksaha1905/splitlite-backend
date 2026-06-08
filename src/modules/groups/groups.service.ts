import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';

@Injectable()
export class GroupsService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async createGroup(
    userId: string,
    dto: CreateGroupDto,
  ) {
    return this.prisma.group.create({
      data: {
        name: dto.name,

        createdById: userId,

        members: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
      },

      include: {
        members: true,
      },
    });
  }

  async getGroup(groupId: string) {
  const group =
    await this.prisma.group.findUnique({
      where: {
        id: groupId,
      },

      include: {
        createdBy: true,

        members: {
          include: {
            user: true,
          },
        },
      },
    });

  if (!group) {
    throw new NotFoundException(
      'Group not found',
    );
  }

  return group;
}

async getMyGroups(
  userId: string,
) {
  return this.prisma.group.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },

    include: {
      members: {
        include: {
          user: true,
        },
      },
    },
  });
}

}