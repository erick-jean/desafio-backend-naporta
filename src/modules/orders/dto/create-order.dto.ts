import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from 'generated/prisma/client';
import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderDto {
  @ApiProperty({
    example: '2026-06-01',
    description: 'Expected delivery date in ISO 8601 format',
  })
  @IsDateString()
  expectedDeliveryDate!: string;

  @ApiProperty({
    example: 'Joao Silva',
    description: 'Customer name',
  })
  @IsString()
  @IsNotEmpty()
  customerName!: string;

  @ApiProperty({
    example: '123.456.789-00',
    description: 'Customer CPF or CNPJ document',
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
    description: 'Initial order status. Defaults to PENDING when omitted.',
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiProperty({
    type: [CreateOrderItemDto],
    description: 'Order items. At least one item is required.',
    minItems: 1,
    example: [
      {
        description: 'Notebook Dell Inspiron',
        price: 3500,
      },
      {
        description: 'Mouse sem fio',
        price: 89.9,
      },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
