import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AuthGuard } from '../auth/auth.guard';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ResponseOrderDto } from './dto/response-order.dto';
import { FilterOrdersDto } from './dto/filter-orders.dto';
import { Request } from 'express';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';

@UseGuards(AuthGuard)
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo pedido' })
  @ApiCreatedResponse({ type: [ResponseOrderDto] })
  create(
    @Body() createOrderDto: CreateOrderDto,
    @Req() req: Request,
  ): Promise<ResponseOrderDto> {
    const user = req['user'] as { sub: string; email: string };
    return this.ordersService.create(createOrderDto, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os pedidos' })
  @ApiCreatedResponse({ type: [ResponseOrderDto] })
  findAll(@Query() filters: FilterOrdersDto) {
    return this.ordersService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtém um pedido pelo ID' })
  @ApiCreatedResponse({ type: [ResponseOrderDto] })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um pedido pelo ID' })
  @ApiOkResponse({ type: ResponseOrderDto })
  update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<ResponseOrderDto> {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Post(':orderId/items')
  @ApiOperation({ summary: 'Adiciona um item ao pedido' })
  @ApiCreatedResponse({ type: ResponseOrderDto })
  addItem(
    @Param('orderId') orderId: string,
    @Body() createOrderItemDto: CreateOrderItemDto,
  ): Promise<ResponseOrderDto> {
    return this.ordersService.addItem(orderId, createOrderItemDto);
  }

  @Patch(':orderId/items/:itemId')
  @ApiOperation({ summary: 'Atualiza um item do pedido' })
  @ApiOkResponse({ type: ResponseOrderDto })
  updateItem(
    @Param('orderId') orderId: string,
    @Param('itemId') itemId: string,
    @Body() updateOrderItemDto: UpdateOrderItemDto,
  ): Promise<ResponseOrderDto> {
    return this.ordersService.updateItem(orderId, itemId, updateOrderItemDto);
  }

  @Delete(':orderId/items/:itemId')
  @ApiOperation({ summary: 'Remove um item do pedido' })
  @ApiOkResponse({ type: ResponseOrderDto })
  removeItem(
    @Param('orderId') orderId: string,
    @Param('itemId') itemId: string,
  ): Promise<ResponseOrderDto> {
    return this.ordersService.removeItem(orderId, itemId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um pedido pelo ID' })
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.ordersService.remove(id);
  }
}
