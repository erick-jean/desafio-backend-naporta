import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { FilterOrdersDto } from './dto/filter-orders.dto';
import { ResponseOrderDto } from './dto/response-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@UseGuards(AuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo pedido' })
  @ApiCreatedResponse({ type: ResponseOrderDto })
  create(
    @Body() createOrderDto: CreateOrderDto,
    @Req() req: Request,
  ): Promise<ResponseOrderDto> {
    const user = req['user'] as { sub: string; email: string };
    return this.ordersService.create(createOrderDto, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os pedidos' })
  @ApiOkResponse({ type: [ResponseOrderDto] })
  findAll(@Query() filters: FilterOrdersDto): Promise<ResponseOrderDto[]> {
    return this.ordersService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca pedido por ID' })
  @ApiOkResponse({ type: ResponseOrderDto })
  @ApiNotFoundResponse({ description: 'Order not found' })
  findOne(@Param('id') id: string): Promise<ResponseOrderDto> {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza pedido' })
  @ApiOkResponse({ type: ResponseOrderDto })
  @ApiNotFoundResponse({ description: 'Order not found' })
  update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<ResponseOrderDto> {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Post(':orderId/items')
  @ApiOperation({ summary: 'Adiciona um item ao pedido' })
  @ApiCreatedResponse({ type: ResponseOrderDto })
  @ApiNotFoundResponse({ description: 'Order not found' })
  addItem(
    @Param('orderId') orderId: string,
    @Body() createOrderItemDto: CreateOrderItemDto,
  ): Promise<ResponseOrderDto> {
    return this.ordersService.addItem(orderId, createOrderItemDto);
  }

  @Patch(':orderId/items/:itemId')
  @ApiOperation({ summary: 'Atualiza um item do pedido' })
  @ApiOkResponse({ type: ResponseOrderDto })
  @ApiNotFoundResponse({ description: 'Order or item not found' })
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
  @ApiNotFoundResponse({ description: 'Order or item not found' })
  removeItem(
    @Param('orderId') orderId: string,
    @Param('itemId') itemId: string,
  ): Promise<ResponseOrderDto> {
    return this.ordersService.removeItem(orderId, itemId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove pedido logicamente' })
  @ApiOkResponse({
    schema: {
      example: {
        message: 'Order deleted successfully',
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Order not found' })
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.ordersService.remove(id);
  }
}
