import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ResponseOrderDto } from './dto/response-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FilterOrdersDto } from './dto/filter-orders.dto';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  create(createOrderDto: CreateOrderDto) {
    return 'This action adds a new order';
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

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
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
