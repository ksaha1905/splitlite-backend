import {
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityAction } from '@prisma/client';

@Injectable()
export class ActivityLogsService {
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
  }

  async createLog(
    groupId: string,
    actorId: string,
    action: ActivityAction,
    message: string,
  ) {
    return this.prisma.activityLog.create({
      data: {
        groupId,
        actorId,
        action,
        message,
      },
    });
  }

  async getGroupLogs(
    userId: string,
    groupId: string,
    page = 1,
    limit = 20,
  ) {
    await this.validateGroupMembership(
      userId,
      groupId,
    );

    const skip = (page - 1) * limit;

    return this.prisma.activityLog.findMany({
      where: {
        groupId,
      },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });
  }
}