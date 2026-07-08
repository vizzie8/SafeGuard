import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@safeguard.com';
  
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Super Admin',
        role: 'ADMIN'
      }
    });
    console.log(`Created admin user with id: ${admin.id}`);
  } else {
    console.log('Admin user already exists.');
  }

  const userEmail = 'user@safeguard.com';
  const existingUser = await prisma.user.findUnique({
    where: { email: userEmail }
  });

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const normalUser = await prisma.user.create({
      data: {
        email: userEmail,
        password: hashedPassword,
        name: 'Test User',
        role: 'USER'
      }
    });
    console.log(`Created normal user with id: ${normalUser.id}`);
  } else {
    console.log('Normal user already exists.');
  }

  // Seed some initial incidents for the logs
  const incidentsCount = await prisma.incident.count();
  if (incidentsCount === 0) {
    const dummyUser = await prisma.user.findFirst();
    if (dummyUser) {
      await prisma.incident.createMany({
        data: [
          { userId: dummyUser.id, title: 'Voice SOS', description: 'Triggered via voice command', lat: 18.5204, lng: 73.8567, status: 'Active' },
          { userId: dummyUser.id, title: 'Fall Detected', description: 'Hard impact detected', lat: 18.5144, lng: 73.8477, status: 'Resolved' },
          { userId: dummyUser.id, title: 'Manual SOS', description: 'Button pressed', lat: 18.5314, lng: 73.8446, status: 'Resolved' }
        ]
      });
      console.log('Seeded initial incidents.');
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
