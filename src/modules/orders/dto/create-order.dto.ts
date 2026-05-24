import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from 'generated/prisma/client';

class CreateOrderItemDto {
  @ApiProperty({
    example: 'Notebook Dell Inspiron',
    description: 'Item description',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    example: 3500,
    description: 'Item price',
  })
  @IsNumber()
  @Min(0)
  price!: number;
}

export class CreateOrderDto {
  @ApiProperty({
    example: '2026-06-01',
    description: 'Expected delivery date',
  })
  @IsDateString()
  expectedDeliveryDate!: string;

  @ApiProperty({
    example: 'João Silva',
    description: 'Customer name',
  })
  @IsString()
  @IsNotEmpty()
  customerName!: string;

  @ApiProperty({
    example: '123.456.789-00',
    description: 'Customer document',
  })
  @IsString()
  @IsNotEmpty()
  customerDocument!: string;

  @ApiProperty({
    example: 'Rua das Flores, 100 - Campo Grande/MS',
    description: 'Delivery address',
  })
  @IsString()
  @IsNotEmpty()
  deliveryAddress!: string;

  @ApiPropertyOptional({
    enum: OrderStatus,
    example: OrderStatus.PENDING,
    description: 'Order status',
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiProperty({
    type: [CreateOrderItemDto],
    description: 'Order items',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
