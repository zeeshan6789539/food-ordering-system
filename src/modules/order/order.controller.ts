import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { PlaceOrderDto } from './dto/place-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../user/entities/user.entity';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Place order from cart' })
  async placeOrder(@CurrentUser() user: User, @Body() dto: PlaceOrderDto) {
    return this.orderService.placeOrder(user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List my orders' })
  async findMyOrders(@CurrentUser() user: User) {
    return this.orderService.findMyOrders(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  async findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.orderService.findOne(id, user.id);
  }
}
