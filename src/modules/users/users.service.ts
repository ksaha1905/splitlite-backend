import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findBySupabaseId(supabaseId: string) {
    return this.prisma.user.findUnique({
      where: {
        supabaseId,
      },
    });
  }

  async createUser(data: {
    supabaseId: string;
    email: string;
  }) {
    return this.prisma.user.create({
      data,
    });
  }

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
  }

  async updateProfile(
    userId: string,
    dto: UpdateUserDto,
  ) {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: dto,
    });
  }
}