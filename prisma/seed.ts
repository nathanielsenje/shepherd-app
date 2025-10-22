import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create default super admin user
  const hashedPassword = await hash('Admin123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@church.org' },
    update: {},
    create: {
      email: 'admin@church.org',
      passwordHash: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  console.log('Created admin user:', admin.email);

  // Create sample household
  const household = await prisma.household.create({
    data: {
      name: 'Smith Family',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701',
    },
  });

  console.log('Created sample household:', household.name);

  // Create sample member
  const member = await prisma.member.create({
    data: {
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@example.com',
      status: 'MEMBER',
      householdId: household.id,
      consentDataStorage: true,
      consentCommunication: true,
      consentDate: new Date(),
    },
  });

  console.log('Created sample member:', `${member.firstName} ${member.lastName}`);

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
