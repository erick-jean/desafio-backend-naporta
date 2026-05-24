import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from 'generated/prisma/enums';

export class OrderItemResponseDto {
  @ApiProperty({
    example: 'b7e0c7b6-8a41-4f35-a91f-9b1a2d8f9f10',
    description: 'Order item ID',
  })
  id!: string;

  @ApiProperty({
    example: 'Notebook Dell Inspiron',
    description: 'Item description',
  })
  description!: string;

  @ApiProperty({
    example: 3500.0,
    description: 'Item price',
  })
  price!: number;

  @ApiProperty({
    example: 'e82f49c2-6c0e-4f97-9a30-4a7f67f7f0c2',
    description: 'Order ID related to this item',
  })
  orderId!: string;
}

export class ResponseOrderDto {
  @ApiProperty({
    example: 'e82f49c2-6c0e-4f97-9a30-4a7f67f7f0c2',
    description: 'Order ID',
  })
  id!: string;

  @ApiProperty({
    example: 'PED-001',
    description: 'Unique order number',
  })
  orderNumber!: string;

  @ApiProperty({
    example: '2026-06-01T00:00:00.000Z',
    description: 'Expected delivery date',
  })
  expectedDeliveryDate!: Date;

  @ApiProperty({
    example: 'João Silva',
    description: 'Customer name',
  })
  customerName!: string;

  @ApiProperty({
    example: '123.456.789-00',
    description: 'Customer document',
  })
  customerDocument!: string;

  @ApiProperty({
    example: 'Rua das Flores, 100 - Campo Grande/MS',
    description: 'Delivery address',
  })
  deliveryAddress!: string;

  @ApiProperty({
    example: OrderStatus.PENDING,
    enum: OrderStatus,
    description: 'Order status',
  })
  status!: OrderStatus;

  @ApiProperty({
    type: [OrderItemResponseDto],
    description: 'Order items',
  })
  items!: OrderItemResponseDto[];

  @ApiProperty({
    example: '2026-05-24T12:00:00.000Z',
    description: 'Order creation date',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-05-24T12:00:00.000Z',
    description: 'Order update date',
  })
  updatedAt!: Date;

  @ApiPropertyOptional({
    example: null,
    description: 'Soft delete date. Null when the order is active.',
  })
  deletedAt?: Date | null;

  @ApiPropertyOptional({
    example: '7b4d9d3c-0f35-4c2a-9c5a-8d8e1f9a1234',
    description: 'User ID that created the order',
  })
  userId?: string | null;
}
