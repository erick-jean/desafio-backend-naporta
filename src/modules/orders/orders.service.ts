import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ResponseOrderDto } from './dto/response-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FilterOrdersDto } from './dto/filter-orders.dto';
import { Prisma } from 'generated/prisma/client';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(
    dto: CreateOrderDto,
    userId: string,
  ): Promise<ResponseOrderDto> {
    try {
      const order = await this.prisma.order.create({
        data: await this.buildCreateOrderData(dto, userId),
        include: {
          items: true,
        },
      });

      return this.toOrderResponseDto(order);
    } catch (error) {
      this.handleOrderNumberConflict(error);
    }
  }

  async findAllOrders(filters: FilterOrdersDto): Promise<ResponseOrderDto[]> {
    const where: Prisma.OrderWhereInput = {
      deletedAt: null,
    };

    if (filters.orderNumber) {
      where.orderNumber = {
        contains: filters.orderNumber,
        mode: 'insensitive',
      };
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};

      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }

      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    const orders = await this.prisma.order.findMany({
      where,
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders.map((order) => this.toOrderResponseDto(order));
  }

  async findOrderById(id: string): Promise<ResponseOrderDto> {
    const order = await this.prisma.order.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    return this.toOrderResponseDto(order);
  }

  async updateOrder(
    id: string,
    updateOrderDto: UpdateOrderDto,
  ): Promise<ResponseOrderDto> {
    const order = await this.prisma.order.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    try {
      const updatedOrder = await this.updateOrderAndIncludeItems(
        id,
        this.buildUpdateOrderData(updateOrderDto),
      );

      return this.toOrderResponseDto(updatedOrder);
    } catch (error) {
      this.handleOrderNumberConflict(error);
    }
  }

  async addOrderItem(
    orderId: string,
    createOrderItemDto: CreateOrderItemDto,
  ): Promise<ResponseOrderDto> {
    await this.getActiveOrderOrThrow(orderId);

    const order = await this.updateOrderAndIncludeItems(orderId, {
      items: {
        create: this.toCreateOrderItemData(createOrderItemDto),
      },
    });

    return this.toOrderResponseDto(order);
  }

  async updateOrderItem(
    orderId: string,
    itemId: string,
    updateOrderItemDto: UpdateOrderItemDto,
  ): Promise<ResponseOrderDto> {
    await this.getActiveOrderOrThrow(orderId);
    await this.getOrderItemOrThrow(orderId, itemId);

    await this.prisma.orderItem.update({
      where: {
        id: itemId,
      },
      data: this.buildUpdateOrderItemData(updateOrderItemDto),
    });

    return this.findOrderById(orderId);
  }

  async removeOrderItem(
    orderId: string,
    itemId: string,
  ): Promise<ResponseOrderDto> {
    await this.getActiveOrderOrThrow(orderId);
    await this.getOrderItemOrThrow(orderId, itemId);

    await this.prisma.orderItem.delete({
      where: {
        id: itemId,
      },
    });

    return this.findOrderById(orderId);
  }

  async softDeleteOrder(id: string): Promise<{ message: string }> {
    await this.getActiveOrderOrThrow(id);

    await this.prisma.order.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return {
      message: 'Order deleted successfully',
    };
  }

  private async generateOrderNumber(): Promise<string> {
    const result = await this.prisma.$queryRaw<{ nextval: bigint }[]>`
    SELECT nextval('order_number_seq')::bigint
  `;

    const nextNumber = Number(result[0].nextval);

    return `PED-${String(nextNumber).padStart(6, '0')}`;
  }

  private async buildCreateOrderData(
    dto: CreateOrderDto,
    userId: string,
  ): Promise<Prisma.OrderCreateInput> {
    return {
      orderNumber: await this.generateOrderNumber(),
      expectedDeliveryDate: new Date(dto.expectedDeliveryDate),
      customerName: dto.customerName,
      customerDocument: dto.customerDocument,
      deliveryAddress: dto.deliveryAddress,
      status: dto.status ?? 'PENDING',
      user: {
        connect: {
          id: userId,
        },
      },
      items: {
        create: dto.items.map((item) => this.toCreateOrderItemData(item)),
      },
    };
  }

  private buildUpdateOrderData(dto: UpdateOrderDto): Prisma.OrderUpdateInput {
    const data: Prisma.OrderUpdateInput = {};

    if (dto.expectedDeliveryDate !== undefined) {
      data.expectedDeliveryDate = new Date(dto.expectedDeliveryDate);
    }

    if (dto.customerName !== undefined) {
      data.customerName = dto.customerName;
    }

    if (dto.customerDocument !== undefined) {
      data.customerDocument = dto.customerDocument;
    }

    if (dto.deliveryAddress !== undefined) {
      data.deliveryAddress = dto.deliveryAddress;
    }

    if (dto.status !== undefined) {
      data.status = dto.status;
    }

    if (dto.items !== undefined) {
      data.items = {
        deleteMany: {},
        create: dto.items.map((item) => this.toCreateOrderItemData(item)),
      };
    }

    return data;
  }

  private buildUpdateOrderItemData(
    dto: UpdateOrderItemDto,
  ): Prisma.OrderItemUpdateInput {
    const data: Prisma.OrderItemUpdateInput = {};

    if (dto.description !== undefined) {
      data.description = dto.description;
    }

    if (dto.price !== undefined) {
      data.price = dto.price;
    }

    return data;
  }

  private toCreateOrderItemData(
    item: CreateOrderItemDto,
  ): Prisma.OrderItemCreateWithoutOrderInput {
    return {
      description: item.description,
      price: item.price,
    };
  }

  private updateOrderAndIncludeItems(
    id: string,
    data: Prisma.OrderUpdateInput,
  ): Promise<Prisma.OrderGetPayload<{ include: { items: true } }>> {
    return this.prisma.order.update({
      where: {
        id,
      },
      data,
      include: {
        items: true,
      },
    });
  }

  private async getActiveOrderOrThrow(
    id: string,
  ): Promise<Prisma.OrderGetPayload<{ include: { items: true } }>> {
    const order = await this.prisma.order.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    return order;
  }

  private async getOrderItemOrThrow(orderId: string, itemId: string) {
    const item = await this.prisma.orderItem.findFirst({
      where: {
        id: itemId,
        orderId,
      },
    });

    if (!item) {
      throw new NotFoundException(
        `Order item with id ${itemId} not found for order ${orderId}`,
      );
    }

    return item;
  }

  private handleOrderNumberConflict(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(
        'An order with this order number already exists',
      );
    }

    throw error;
  }

  private toOrderResponseDto(
    order: Prisma.OrderGetPayload<{ include: { items: true } }>,
  ): ResponseOrderDto {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      expectedDeliveryDate: order.expectedDeliveryDate,
      customerName: order.customerName,
      customerDocument: order.customerDocument,
      deliveryAddress: order.deliveryAddress,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      deletedAt: order.deletedAt,
      userId: order.userId,
      items: order.items.map((item) => ({
        id: item.id,
        description: item.description,
        price: Number(item.price),
        orderId: item.orderId,
      })),
    };
  }
}
