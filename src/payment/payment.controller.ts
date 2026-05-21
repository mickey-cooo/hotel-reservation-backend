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
import { PaymentService } from './payment.service';
import { CreatePaymentBodyDto } from './dto/create-payment.dto';
import { UpdatePaymentBodyDto } from './dto/update-payment.dto';
import {
  ParamPaymentDto,
  ParamPaymentQueryDto,
} from './dto/payment-params.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('/create')
  create(@Body() body: CreatePaymentBodyDto) {
    return this.paymentService.create(body);
  }

  @Get('/list')
  findAll(@Query() query: ParamPaymentQueryDto) {
    return this.paymentService.findAll(query);
  }

  @Get('/:id')
  findOne(@Param() param: ParamPaymentDto) {
    return this.paymentService.findOne(param);
  }

  @Patch('/update/:id')
  update(@Param() param: ParamPaymentDto, @Body() body: UpdatePaymentBodyDto) {
    return this.paymentService.update(param, body);
  }

  @Delete('/delete/:id')
  delete(@Param() param: ParamPaymentDto) {
    return this.paymentService.delete(param);
  }
}
