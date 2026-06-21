import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { BalanceService } from '../services/balance.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('balance')
@UseGuards(JwtAuthGuard)
export class BalanceController {
  private readonly logger = new Logger(BalanceController.name);

  constructor(private readonly balanceService: BalanceService) {}

  @Get()
  async getBalance(@Request() req: any) {
    this.logger.log(`Getting balance for user ${req.user.id}`);
    return this.balanceService.getBalance(req.user.id);
  }

  @Post('topup')
  async topUp(
    @Request() req: any,
    @Body() body: { amount: number; paymentMethod: string },
  ) {
    this.logger.log(
      `Topup request for user ${req.user.id}: amount=${body.amount}, method=${body.paymentMethod}`,
    );
    return this.balanceService.topUp(
      req.user.id,
      body.amount,
      body.paymentMethod,
    );
  }

  @Get('transactions')
  async getTransactions(@Request() req: any) {
    return this.balanceService.getTransactions(req.user.id);
  }
}
