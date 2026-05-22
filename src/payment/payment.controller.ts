import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AuthGuard } from 'src/guard/auth.guard';
import { PaymentService } from './payment.service';
import { CreatePaymentBodyDto } from './dto/create-payment.dto';
import { UpdatePaymentBodyDto } from './dto/update-payment.dto';
import {
  ParamPaymentIdDto,
  ParamPaymentQueryDto,
} from './dto/payment-params.dto';
import { ApiTags } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { Token } from '../decorator/token.decorator';
import { TokenPayload } from '../helper/app.const';
@ApiTags('Payment')
@UseGuards(AuthGuard)
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('/create')
  async create(
    @Body() body: CreatePaymentBodyDto,
    @Token() token: TokenPayload,
  ) {
    return await this.paymentService.create(body, token.id);
  }

  @Get('/list')
  async findAll(@Query() query: ParamPaymentQueryDto) {
    return await this.paymentService.findAll(query);
  }

  @Get('/:id')
  async findOne(@Param() param: ParamPaymentIdDto) {
    return await this.paymentService.findOne(param);
  }

  @Patch('/update/:id')
  async update(
    @Param() param: ParamPaymentIdDto,
    @Body() body: UpdatePaymentBodyDto,
  ) {
    return await this.paymentService.update(param, body);
  }

  @Delete('/delete/:id')
  async delete(@Param() param: ParamPaymentIdDto) {
    return await this.paymentService.delete(param);
  }
}
