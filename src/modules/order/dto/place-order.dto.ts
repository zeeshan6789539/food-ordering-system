import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class PlaceOrderDto {
  @ApiProperty({ enum: ['card', 'cash', 'online', 'other'] })
  @IsIn(['card', 'cash', 'online', 'other'])
  paymentType: 'card' | 'cash' | 'online' | 'other';
}
