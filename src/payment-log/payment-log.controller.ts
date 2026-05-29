import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PaymentLogService } from './payment-log.service';
import { CreatePaymentLogBodyDto } from './dto/create-payment-log.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/guard/auth.guard';
import { UseGuards } from '@nestjs/common';
import { Token } from '../decorator/token.decorator';
import { TokenPayload } from '../helper/app.const';

@ApiTags('Payment Log')
@UseGuards(AuthGuard)
@Controller('payment-log')
export class PaymentLogController {
  constructor(private readonly paymentLogService: PaymentLogService) {}

  @Post('/create')
  async create(
    @Body() body: CreatePaymentLogBodyDto,
    @Token() token: TokenPayload,
  ) {
    return await this.paymentLogService.create(body, token.id);
  }
}
