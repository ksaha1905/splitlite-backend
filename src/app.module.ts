import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { GroupsModule } from './modules/groups/groups.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { BalancesModule } from './modules/balances/balances.module';
import { SettlementsModule } from './modules/settlements/settlements.module';
import { ActivityLogsModule } from './modules/activity-logs/activity-logs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    GroupsModule,
    ExpensesModule,
    BalancesModule,
    SettlementsModule,
    ActivityLogsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
