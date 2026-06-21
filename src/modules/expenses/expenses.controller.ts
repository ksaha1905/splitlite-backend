import {
  Body,
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { GetExpensesQueryDto } from './dto/get-expenses-query.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Controller('expenses')
@UseGuards(AuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  createExpense(@CurrentUser() user: any, @Body() dto: CreateExpenseDto) {
    return this.expensesService.createExpense(user.id, dto);
  }

  @Get('/group/:groupId')
  getGroupExpenses(
    @CurrentUser() user: any,
    @Param('groupId') groupId: string,
    @Query() query: GetExpensesQueryDto,
  ) {
    return this.expensesService.getGroupExpenses(user.id, groupId, query);
  }

  @Get(':expenseId')
  getExpenseDetails(
    @CurrentUser() user: any,
    @Param('expenseId') expenseId: string,
  ) {
    return this.expensesService.getExpenseDetails(user.id, expenseId);
  }

  @Patch(':expenseId')
  updateExpense(
    @CurrentUser() user: any,
    @Param('expenseId') expenseId: string,
    @Body() dto: UpdateExpenseDto,
  ) {
    return this.expensesService.updateExpense(user.id, expenseId, dto);
  }

  @Delete(':expenseId')
  deleteExpense(
    @CurrentUser() user: any,
    @Param('expenseId') expenseId: string,
  ) {
    return this.expensesService.deleteExpense(user.id, expenseId);
  }
}
