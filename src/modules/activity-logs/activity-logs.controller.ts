import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ActivityLogsService } from './activity-logs.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('activity-logs')
@UseGuards(AuthGuard)
export class ActivityLogsController {
  constructor(
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  @Get('groups/:groupId')
  getGroupLogs(
    @CurrentUser() user: any,
    @Param('groupId') groupId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.activityLogsService.getGroupLogs(
      user.id,
      groupId,
      Number(page) || 1,
      Number(limit) || 20,
    );
  }
}