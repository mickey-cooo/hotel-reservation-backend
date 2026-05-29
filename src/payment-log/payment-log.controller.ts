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
import {
  ListParamsPaymentLogDto,
  ParamPaymentLogDto,
} from './dto/params.payment-log.dto';
import { UpdatePaymentLogBodyDto } from './dto/update-payment-log.dto';

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

  @Get('/list')
  async findAll(body: ListParamsPaymentLogDto) {
    return await this.paymentLogService.findAll(body);
  }

  @Get('/:id')
  async findById(@Param() param: ParamPaymentLogDto) {
    return await this.paymentLogService.findById(param);
  }

  @Patch('/update/:id')
  async update(
    @Param() param: ParamPaymentLogDto,
    @Body() body: UpdatePaymentLogBodyDto,
  ) {
    return await this.paymentLogService.update(param, body);
  }

  @Delete('/delete/:id')
  async delete(@Param() param: ParamPaymentLogDto) {
    return await this.paymentLogService.delete(param);
  }
}
