
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST', 'smtp.gmail.com'),
      port: parseInt(this.configService.get('SMTP_PORT', '587')),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendPasswordChangeEmail(email: string, name: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.configService.get('SMTP_FROM', 'noreply@codezone.com'),
      to: email,
      subject: 'Пароль изменен',
      html: `
        <h2>Здравствуйте, ${name}!</h2>
        <p>Ваш пароль на сайте CodeZone был успешно изменен.</p>
        <p>Если это были не вы, пожалуйста, свяжитесь с поддержкой.</p>
        <br/>
        <p>С уважением,<br/>Команда CodeZone</p>
      `,
    });
  }

  async sendRegistrationEmail(email: string, name: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.configService.get('SMTP_FROM', 'noreply@codezone.com'),
      to: email,
      subject: 'Добро пожаловать в CodeZone!',
      html: `
        <h2>Здравствуйте, ${name}!</h2>
        <p>Добро пожаловать в школу программирования CodeZone!</p>
        <p>Мы рады видеть вас в числе наших учеников.</p>
        <p>Начните свое обучение прямо сейчас - выберите интересующее вас направление и запишитесь на занятия.</p>
        <br/>
        <p>С уважением,<br/>Команда CodeZone</p>
      `,
    });
  }

  async sendPaymentSuccessEmail(
    email: string,
    name: string,
    amount: number,
  ): Promise<void> {
    await this.transporter.sendMail({
      from: this.configService.get('SMTP_FROM', 'noreply@codezone.com'),
      to: email,
      subject: 'Пополнение баланса',
      html: `
        <h2>Здравствуйте, ${name}!</h2>
        <p>Ваш баланс был успешно пополнен на <strong>${amount} BYN</strong>.</p>
        <p>Текущий баланс: вы можете проверить в личном кабинете.</p>
        <br/>
        <p>С уважением,<br/>Команда CodeZone</p>
      `,
    });
  }
}
