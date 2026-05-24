import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateOrderItemDto {
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
