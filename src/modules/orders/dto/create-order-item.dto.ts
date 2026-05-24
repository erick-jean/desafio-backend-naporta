import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateOrderItemDto {
  @ApiProperty({
    example: 'Notebook Dell Inspiron',
    description: 'Order item description',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    example: 3500,
    description: 'Order item price. Must be zero or greater.',
  })
  @IsNumber()
  @Min(0)
  price!: number;
}
