
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserBalance } from '../entities/user-balance.entity';
import {
  BalanceTransaction,
  TransactionType,
  TransactionStatus,
} from '../entities/balance-transaction.entity';
import { User } from '../entities/user.entity';
import { EmailService } from './email.service';
import { NotificationsService } from './notifications.service';
import { NotificationType } from '../entities/notification.entity';

@Injectable()
export class BalanceService {
  private readonly logger = new Logger(BalanceService.name);

  constructor(
    @InjectRepository(UserBalance)
    private balanceRepo: Repository<UserBalance>,
    @InjectRepository(BalanceTransaction)
    private transactionRepo: Repository<BalanceTransaction>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private emailService: EmailService,
    private notificationsService: NotificationsService,
  ) {}

  private normalizeBalance(balance: any): number {
    if (balance === null || balance === undefined) return 0;
    if (typeof balance === 'string') {
      const parsed = parseFloat(balance);
      return isNaN(parsed) ? 0 : parsed;
    }
    if (typeof balance === 'number') return balance;
    return 0;
  }

  async getBalance(userId: number): Promise<{ balance: number }> {
    this.logger.log(`Getting balance for user ${userId}`);
    let balance = await this.balanceRepo.findOne({ where: { userId } });
    if (!balance) {
      this.logger.log(`Creating new balance record for user ${userId}`);
      balance = this.balanceRepo.create({ userId, balance: 0 });
      await this.balanceRepo.save(balance);
    }
    return { balance: this.normalizeBalance(balance.balance) };
  }

  async topUp(
    userId: number,
    amount: number,
    paymentMethod: string,
  ): Promise<{ balance: number; transaction: BalanceTransaction }> {
    this.logger.log(`Topup for user ${userId}: amount=${amount}`);

    const topUpAmount = Number(amount);
    if (isNaN(topUpAmount) || topUpAmount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    let balance = await this.balanceRepo.findOne({ where: { userId } });
    if (!balance) {
      this.logger.log(`Creating new balance record for user ${userId}`);
      balance = this.balanceRepo.create({ userId, balance: 0 });
      await this.balanceRepo.save(balance);
    }

    const currentBalance = this.normalizeBalance(balance.balance);
    const newBalance = currentBalance + topUpAmount;

    this.logger.log(
      `Balance update: ${currentBalance} + ${topUpAmount} = ${newBalance}`,
    );

    
    const transaction = this.transactionRepo.create({
      userId,
      type: TransactionType.DEPOSIT,
      amount: topUpAmount,
      status: TransactionStatus.COMPLETED,
      description: `Пополнение баланса на ${topUpAmount} BYN`,
      paymentMethod,
      transactionId: `TXN_${Date.now()}_${userId}`,
      balanceAfter: newBalance, 
    });
    await this.transactionRepo.save(transaction);
    this.logger.log(`Transaction created: ${transaction.id}`);

    
    await this.balanceRepo
      .createQueryBuilder()
      .update(UserBalance)
      .set({ balance: newBalance })
      .where('userId = :userId', { userId })
      .execute();

    const updatedBalance = await this.balanceRepo.findOne({
      where: { userId },
    });
    this.logger.log(
      `Balance updated: ${currentBalance} -> ${updatedBalance?.balance}`,
    );

    
    try {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (user) {
        this.emailService
          .sendPaymentSuccessEmail(user.email, user.name, topUpAmount)
          .catch((err) => {
            this.logger.error(`Failed to send email: ${err.message}`);
          });

        await this.notificationsService.create(
          userId,
          'Баланс пополнен',
          `Ваш баланс пополнен на ${topUpAmount} BYN. Текущий баланс: ${newBalance} BYN`,
          NotificationType.SYSTEM,
          '/dashboard/profile',
        );
      }
    } catch (err: any) {
      this.logger.error(`Failed to send notifications: ${err.message}`);
    }

    return {
      balance: this.normalizeBalance(updatedBalance?.balance || 0),
      transaction,
    };
  }

  async withdraw(
    userId: number,
    amount: number,
    description: string,
  ): Promise<{ balance: number; transaction: BalanceTransaction }> {
    const withdrawAmount = Number(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    let balance = await this.balanceRepo.findOne({ where: { userId } });
    if (!balance) {
      throw new NotFoundException('Баланс не найден');
    }

    const currentBalance = this.normalizeBalance(balance.balance);

    if (currentBalance < withdrawAmount) {
      throw new BadRequestException('Недостаточно средств на балансе');
    }

    const newBalance = currentBalance - withdrawAmount;

    
    const transaction = this.transactionRepo.create({
      userId,
      type: TransactionType.WITHDRAWAL,
      amount: withdrawAmount,
      status: TransactionStatus.COMPLETED,
      description,
      balanceAfter: newBalance, 
    });
    await this.transactionRepo.save(transaction);

    await this.balanceRepo
      .createQueryBuilder()
      .update(UserBalance)
      .set({ balance: newBalance })
      .where('userId = :userId', { userId })
      .execute();

    const updatedBalance = await this.balanceRepo.findOne({
      where: { userId },
    });

    
    try {
      await this.notificationsService.create(
        userId,
        'Списание с баланса',
        `С вашего баланса списано ${withdrawAmount} BYN. Причина: ${description}. Текущий баланс: ${newBalance} BYN`,
        NotificationType.SYSTEM,
        '/dashboard/profile',
      );
    } catch (err: any) {
      this.logger.error(`Failed to send notification: ${err.message}`);
    }

    return {
      balance: this.normalizeBalance(updatedBalance?.balance || 0),
      transaction,
    };
  }

  async getTransactions(userId: number): Promise<BalanceTransaction[]> {
    return this.transactionRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getBalanceInfo(userId: number): Promise<{
    balance: number;
    totalSpent: number;
    totalDeposited: number;
  }> {
    const [balance, transactions] = await Promise.all([
      this.getBalance(userId),
      this.getTransactions(userId),
    ]);

    let totalSpent = 0;
    let totalDeposited = 0;

    for (const transaction of transactions) {
      if (transaction.type === TransactionType.WITHDRAWAL) {
        totalSpent += this.normalizeBalance(transaction.amount);
      } else if (transaction.type === TransactionType.DEPOSIT) {
        totalDeposited += this.normalizeBalance(transaction.amount);
      }
    }

    return {
      balance: balance.balance,
      totalSpent,
      totalDeposited,
    };
  }

  async checkBalance(userId: number, amount: number): Promise<boolean> {
    const { balance } = await this.getBalance(userId);
    return balance >= amount;
  }
}
