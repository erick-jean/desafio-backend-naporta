import { PrismaClient } from '@prisma/client/extension'; 
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('123456', 10);

  const admin = await prisma.user.upsert({
    where: {
      email: 'admin@email.com',
    },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@email.com',
      password: passwordHash,
    },
  });

  console.log('Usuário admin criado:', admin.email);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });