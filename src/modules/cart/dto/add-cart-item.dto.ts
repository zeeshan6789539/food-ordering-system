import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, Min } from 'class-validator';

export class AddCartItemDto {
  @ApiProperty()
  @IsUUID()
  productId: string;

  @ApiProperty()
  @IsUUID()
  variantId: string;

  @ApiProperty({ minimum: 1, default: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class UpdateCartItemDto {
  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}
