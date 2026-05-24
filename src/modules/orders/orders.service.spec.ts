import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrdersService } from './orders.service';

type PrismaMock = {
  order: {
    create: jest.Mock;
    findMany: jest.Mock;
    findFirst: jest.Mock;
    update: jest.Mock;
  };
  orderItem: {
    findFirst: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  $queryRaw: jest.Mock;
};

const orderItem = {
  id: 'item-1',
  description: 'Notebook Dell Inspiron',
  price: 3500,
  orderId: 'order-1',
};

const activeOrder = {
  id: 'order-1',
  orderNumber: 'PED-000001',
  expectedDeliveryDate: new Date('2026-06-01'),
  customerName: 'Joao Silva',
  customerDocument: '123.456.789-00',
  deliveryAddress: 'Rua das Flores, 100 - Campo Grande/MS',
  status: 'PENDING' as const,
  createdAt: new Date('2026-05-24'),
  updatedAt: new Date('2026-05-24'),
  deletedAt: null,
  userId: 'user-1',
  items: [orderItem],
};

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    prisma = {
      order: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      orderItem: {
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      $queryRaw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should list active orders', async () => {
    prisma.order.findMany.mockResolvedValue([activeOrder]);

    const result = await service.findAllOrders({});

    expect(prisma.order.findMany).toHaveBeenCalledWith({
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
    expect(result).toHaveLength(1);
    expect(result[0].orderNumber).toBe('PED-000001');
    expect(result[0].items).toHaveLength(1);
  });

  it('should find order by id', async () => {
    prisma.order.findFirst.mockResolvedValue(activeOrder);

    const result = await service.findOrderById('order-1');

    expect(prisma.order.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'order-1',
        deletedAt: null,
      },
      include: {
        items: true,
      },
    });
    expect(result.id).toBe('order-1');
    expect(result.items[0].price).toBe(3500);
  });

  it('should throw NotFoundException when order does not exist', async () => {
    prisma.order.findFirst.mockResolvedValue(null);

    await expect(service.findOrderById('missing-order')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should soft delete order by filling deletedAt', async () => {
    prisma.order.findFirst.mockResolvedValue(activeOrder);
    prisma.order.update.mockResolvedValue({
      ...activeOrder,
      deletedAt: new Date('2026-05-25'),
    });

    await expect(service.softDeleteOrder('order-1')).resolves.toEqual({
      message: 'Order deleted successfully',
    });
    expect(prisma.order.update).toHaveBeenCalledWith({
      where: {
        id: 'order-1',
      },
      data: {
        deletedAt: expect.any(Date) as Date,
      },
    });
  });

  it('should not return logically deleted orders', async () => {
    prisma.order.findMany.mockResolvedValue([]);

    const result = await service.findAllOrders({});

    expect(prisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deletedAt: null,
        }) as object,
      }),
    );
    expect(result).toEqual([]);
  });
});
