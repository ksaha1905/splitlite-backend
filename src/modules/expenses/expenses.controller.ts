import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Controller('expenses')
@UseGuards(AuthGuard)
export class ExpensesController {
  constructor(
    private readonly expensesService: ExpensesService,
  ) {}

  @Post()
  createExpense(
    @CurrentUser() user: any,
    @Body() dto: CreateExpenseDto,
  ) {
    return this.expensesService.createExpense(
      user.id,
      dto,
    );
  }

  @Get('/group/:groupId')
getGroupExpenses(
  @CurrentUser() user: any,
  @Param('groupId') groupId: string,
) {
  return this.expensesService.getGroupExpenses(
    user.id,
    groupId,
  );
}
}