const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const password = 'Admin123';
  const hashedPassword = bcrypt.hashSync(password, 10);

  const user = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password_hash: hashedPassword,
      name: 'Admin User',
      role: 'admin',
    },
  });

  console.log('User created:', user);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());