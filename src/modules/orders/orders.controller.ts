import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
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
import { AuthGuard } from '../auth/auth.guard';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../auth/decorators/current-user.decorator';
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
  createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<ResponseOrderDto> {
    return this.ordersService.createOrder(createOrderDto, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os pedidos' })
  @ApiOkResponse({ type: [ResponseOrderDto] })
  findAllOrders(
    @Query() filters: FilterOrdersDto,
  ): Promise<ResponseOrderDto[]> {
    return this.ordersService.findAllOrders(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca pedido por ID' })
  @ApiOkResponse({ type: ResponseOrderDto })
  @ApiNotFoundResponse({ description: 'Order not found' })
  findOrderById(@Param('id') id: string): Promise<ResponseOrderDto> {
    return this.ordersService.findOrderById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza pedido' })
  @ApiOkResponse({ type: ResponseOrderDto })
  @ApiNotFoundResponse({ description: 'Order not found' })
  updateOrder(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<ResponseOrderDto> {
    return this.ordersService.updateOrder(id, updateOrderDto);
  }

  @Post(':orderId/items')
  @ApiOperation({ summary: 'Adiciona um item ao pedido' })
  @ApiCreatedResponse({ type: ResponseOrderDto })
  @ApiNotFoundResponse({ description: 'Order not found' })
  addOrderItem(
    @Param('orderId') orderId: string,
    @Body() createOrderItemDto: CreateOrderItemDto,
  ): Promise<ResponseOrderDto> {
    return this.ordersService.addOrderItem(orderId, createOrderItemDto);
  }

  @Patch(':orderId/items/:itemId')
  @ApiOperation({ summary: 'Atualiza um item do pedido' })
  @ApiOkResponse({ type: ResponseOrderDto })
  @ApiNotFoundResponse({ description: 'Order or item not found' })
  updateOrderItem(
    @Param('orderId') orderId: string,
    @Param('itemId') itemId: string,
    @Body() updateOrderItemDto: UpdateOrderItemDto,
  ): Promise<ResponseOrderDto> {
    return this.ordersService.updateOrderItem(
      orderId,
      itemId,
      updateOrderItemDto,
    );
  }

  @Delete(':orderId/items/:itemId')
  @ApiOperation({ summary: 'Remove um item do pedido' })
  @ApiOkResponse({ type: ResponseOrderDto })
  @ApiNotFoundResponse({ description: 'Order or item not found' })
  removeOrderItem(
    @Param('orderId') orderId: string,
    @Param('itemId') itemId: string,
  ): Promise<ResponseOrderDto> {
    return this.ordersService.removeOrderItem(orderId, itemId);
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
  softDeleteOrder(@Param('id') id: string): Promise<{ message: string }> {
    return this.ordersService.softDeleteOrder(id);
  }
}
