import {
  Body,
  Controller,
  Post,
  Get,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateGroupDto } from './dto/create-group.dto';
import { JoinGroupDto } from './dto/join-group.dto';

@Controller('groups')
@UseGuards(AuthGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  createGroup(@CurrentUser() user: any, @Body() dto: CreateGroupDto) {
    return this.groupsService.createGroup(user.id, dto);
  }

  @Get(':id')
  getGroup(@Param('id') groupId: string) {
    return this.groupsService.getGroup(groupId);
  }

  @Get()
  getMyGroups(@CurrentUser() user: any) {
    return this.groupsService.getMyGroups(user.id);
  }

  @Patch(':id/invite-code')
  generateInviteCode(@Param('id') groupId: string) {
    return this.groupsService.generateInviteCode(groupId);
  }

  @Post('join')
joinGroup(
  @CurrentUser() user: any,
  @Body() dto: JoinGroupDto,
) {
  return this.groupsService.joinGroup(
    user.id,
    dto,
  );
}
}
