import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  getMe(@CurrentUser() user: any) {
    return this.authService.getCurrentUser(
      user,
    );
  }
}