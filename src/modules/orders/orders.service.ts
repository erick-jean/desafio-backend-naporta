import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ResponseOrderDto } from './dto/response-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  create(createOrderDto: CreateOrderDto) {
    return 'This action adds a new order';
  }

  async findAll(): Promise<ResponseOrderDto[]> {
    const orders = await this.prisma.order.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders.map((order) => ({
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
    }));
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
}
