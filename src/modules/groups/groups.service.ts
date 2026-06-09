import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { JoinGroupDto } from './dto/join-group.dto';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  async createGroup(userId: string, dto: CreateGroupDto) {
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
    const group = await this.prisma.group.findUnique({
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
      throw new NotFoundException('Group not found');
    }

    return group;
  }

  async getMyGroups(userId: string) {
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

  async generateInviteCode(groupId: string) {
    const group = await this.prisma.group.findUnique({
      where: {
        id: groupId,
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    return this.prisma.group.update({
      where: {
        id: groupId,
      },

      data: {
        inviteCode,
      },
    });
  }

  async joinGroup(userId: string, dto: JoinGroupDto) {
    const group = await this.prisma.group.findUnique({
      where: {
        inviteCode: dto.inviteCode,
      },
    });

    if (!group) {
      throw new NotFoundException('Invalid invite code');
    }

    const existingMembership = await this.prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId: group.id,
        },
      },
    });

    if (existingMembership) {
      throw new ConflictException('Already a member');
    }

    return this.prisma.groupMember.create({
      data: {
        userId,
        groupId: group.id,
        role: 'MEMBER',
      },
    });
  }

  async getMembers(groupId: string) {
    const group = await this.prisma.group.findUnique({
      where: {
        id: groupId,
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    return this.prisma.groupMember.findMany({
      where: {
        groupId,
      },

      include: {
        user: {
          select: {
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });
  }
}
