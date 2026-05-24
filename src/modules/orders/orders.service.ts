import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ResponseOrderDto } from './dto/response-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FilterOrdersDto } from './dto/filter-orders.dto';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrderDto, userId: string): Promise<ResponseOrderDto> {
    const order = await this.prisma.order.create({
      data: {
        orderNumber: await this.generateOrderNumber(),
        expectedDeliveryDate: new Date(dto.expectedDeliveryDate),
        customerName: dto.customerName,
        customerDocument: dto.customerDocument,
        deliveryAddress: dto.deliveryAddress,
        status: dto.status ?? 'PENDING',
        userId: userId,
        items: {
          create: dto.items.map((item) => ({
            description: item.description,
            price: item.price,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return this.mapOrderToResponse(order);
  }

  async findAll(filters: FilterOrdersDto): Promise<ResponseOrderDto[]> {
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

    return orders.map((order) => this.mapOrderToResponse(order));
  }

  async findOne(id: string): Promise<ResponseOrderDto> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) {
      throw new Error(`Order with id ${id} not found`);
    }
    return this.mapOrderToResponse(order);
  }

  update(id: number, _updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  async remove(id: string): Promise<{ message: string }> {
    const order = await this.prisma.order.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

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

  // Gera um número de pedido único usando uma sequência no banco de dados
  private async generateOrderNumber(): Promise<string> {
    const result = await this.prisma.$queryRaw<{ nextval: bigint }[]>`
    SELECT nextval('order_number_seq')::bigint
  `;

    const nextNumber = Number(result[0].nextval);

    return `PED-${String(nextNumber).padStart(6, '0')}`;
  }

  // Mapeia o resultado do banco para o formato de resposta da API
  private mapOrderToResponse(
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
