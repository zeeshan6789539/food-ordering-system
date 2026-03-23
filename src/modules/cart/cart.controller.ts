import { Body, Controller, Get, Param, Post, Put, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddCartItemDto, UpdateCartItemDto } from './dto/add-cart-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../user/entities/user.entity';

@ApiTags('cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user cart' })
  async getCart(@CurrentUser() user: User) {
    return this.cartService.getCart(user);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  async addItem(@CurrentUser() user: User, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(user, dto);
  }

  @Put('items/:itemId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  async updateItem(
    @CurrentUser() user: User,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(user, itemId, dto);
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Remove item from cart' })
  async removeItem(@CurrentUser() user: User, @Param('itemId') itemId: string) {
    return this.cartService.removeItem(user, itemId);
  }
}
