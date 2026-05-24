import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { JwtService } from '@nestjs/jwt';

describe('OrdersController', () => {
  let controller: OrdersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: {
            createOrder: jest.fn(),
            findAllOrders: jest.fn(),
            findOrderById: jest.fn(),
            updateOrder: jest.fn(),
            softDeleteOrder: jest.fn(),
            addOrderItem: jest.fn(),
            updateOrderItem: jest.fn(),
            removeOrderItem: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
