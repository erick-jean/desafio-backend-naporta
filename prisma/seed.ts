import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/prisma/client';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL não encontrada no .env');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash('123456', 10);

  const admin = await prisma.user.upsert({
    where: {
      email: 'admin@email.com',
    },
    update: {
      name: 'Administrador',
      password: passwordHash,
    },
    create: {
      email: 'admin@email.com',
      name: 'Administrador',
      password: passwordHash,
    },
  });

  const orders = [
    {
      orderNumber: 'PED-000001',
      expectedDeliveryDate: new Date('2026-06-01'),
      customerName: 'João Silva',
      customerDocument: '123.456.789-00',
      deliveryAddress: 'Rua das Flores, 100 - Campo Grande/MS',
      status: 'PENDING' as const,
      items: [
        {
          description: 'Notebook Dell Inspiron',
          price: '3500.00',
        },
        {
          description: 'Mouse sem fio',
          price: '89.90',
        },
      ],
    },
    {
      orderNumber: 'PED-000002',
      expectedDeliveryDate: new Date('2026-06-03'),
      customerName: 'Maria Oliveira',
      customerDocument: '987.654.321-00',
      deliveryAddress: 'Av. Afonso Pena, 2500 - Campo Grande/MS',
      status: 'PROCESSING' as const,
      items: [
        {
          description: 'Monitor LG 24 polegadas',
          price: '899.90',
        },
        {
          description: 'Teclado mecânico',
          price: '249.90',
        },
      ],
    },
    {
      orderNumber: 'PED-000003',
      expectedDeliveryDate: new Date('2026-06-05'),
      customerName: 'Carlos Souza',
      customerDocument: '456.789.123-00',
      deliveryAddress: 'Rua Bahia, 450 - Campo Grande/MS',
      status: 'SHIPPED' as const,
      items: [
        {
          description: 'Cadeira ergonômica',
          price: '1200.00',
        },
      ],
    },
    {
      orderNumber: 'PED-000004',
      expectedDeliveryDate: new Date('2026-06-08'),
      customerName: 'Ana Pereira',
      customerDocument: '321.654.987-00',
      deliveryAddress: 'Rua Ceará, 890 - Campo Grande/MS',
      status: 'DELIVERED' as const,
      items: [
        {
          description: 'Smartphone Samsung',
          price: '2200.00',
        },
        {
          description: 'Capa protetora',
          price: '59.90',
        },
        {
          description: 'Película de vidro',
          price: '39.90',
        },
      ],
    },
    {
      orderNumber: 'PED-000005',
      expectedDeliveryDate: new Date('2026-06-10'),
      customerName: 'Fernando Lima',
      customerDocument: '789.123.456-00',
      deliveryAddress: 'Rua Rui Barbosa, 1200 - Campo Grande/MS',
      status: 'CANCELED' as const,
      items: [
        {
          description: 'Impressora multifuncional',
          price: '749.90',
        },
      ],
    },
  ];

  for (const order of orders) {
    await prisma.order.upsert({
      where: {
        orderNumber: order.orderNumber,
      },
      update: {
        expectedDeliveryDate: order.expectedDeliveryDate,
        customerName: order.customerName,
        customerDocument: order.customerDocument,
        deliveryAddress: order.deliveryAddress,
        status: order.status,
        deletedAt: null,
        userId: admin.id,
        items: {
          deleteMany: {},
          create: order.items.map((item) => ({
            description: item.description,
            price: item.price,
          })),
        },
      },
      create: {
        orderNumber: order.orderNumber,
        expectedDeliveryDate: order.expectedDeliveryDate,
        customerName: order.customerName,
        customerDocument: order.customerDocument,
        deliveryAddress: order.deliveryAddress,
        status: order.status,
        deletedAt: null,
        userId: admin.id,
        items: {
          create: order.items.map((item) => ({
            description: item.description,
            price: item.price,
          })),
        },
      },
    });
  }

  await syncOrderNumberSequence();

  console.log('Seed executado com sucesso');
  console.log({
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
    },
    ordersCreated: orders.length,
  });
}

async function syncOrderNumberSequence(): Promise<void> {
  await prisma.$executeRaw`
    SELECT setval(
      'order_number_seq',
      COALESCE(
        (
          SELECT MAX(substring("orderNumber" FROM '^PED-(\\d+)$')::bigint)
          FROM "orders"
          WHERE "orderNumber" ~ '^PED-\\d+$'
        ),
        1
      ),
      true
    )
  `;
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
