const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Seed Users
  const user1 = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      password: '$2b$10$4uk.wCJvhIkrVUWga1HPk.voHd5L53sjGnohFDKr1ZVIlwPTeW9Xm', // password
      role: 'user',
      isEmailVerified: true,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: '$2b$10$4uk.wCJvhIkrVUWga1HPk.voHd5L53sjGnohFDKr1ZVIlwPTeW9Xm', // password
      role: 'admin',
      isEmailVerified: true,
    },
  });

  // Seed Categories
  const category1 = await prisma.category.create({
    data: {
      name: 'Beaches',
      imageUrl: 'http://example.com/beach.jpg',
    },
  });

  const category2 = await prisma.category.create({
    data: {
      name: 'Mountains',
      imageUrl: 'http://example.com/mountain.jpg',
    },
  });

  // Seed Destinations
  const destination1 = await prisma.destination.create({
    data: {
      placeName: 'Bali Beach',
      description: 'A beautiful beach in Bali.',
      address: 'Bali, Indonesia',
      categoryId: category1.id,
    },
  });

  const destination2 = await prisma.destination.create({
    data: {
      placeName: 'Mount Fuji',
      description: 'A famous mountain in Japan.',
      address: 'Japan',
      categoryId: category2.id,
    },
  });

  // Seed Travel Plans
  const travelPlan1 = await prisma.travelPlan.create({
    data: {
      name: 'Summer Vacation',
      city: 'Bali',
      travelCompanion: 'Family',
      budget: 2000,
      travelTheme: 'Relaxation',
      startDate: new Date('2023-07-01'),
      endDate: new Date('2023-07-10'),
      userId: user1.id,
    },
  });

  await prisma.travelPlan.create({
    data: {
      name: 'Winter Adventure',
      city: 'Japan',
      travelCompanion: 'Friends',
      budget: 1500,
      travelTheme: 'Adventure',
      startDate: new Date('2023-12-15'),
      endDate: new Date('2023-12-25'),
      userId: user2.id,
    },
  });

  // Seed Travel Days
  const travelDay1 = await prisma.travelDay.create({
    data: {
      day: 1,
      date: new Date('2023-07-01'),
      travelPlanId: travelPlan1.id,
    },
  });

  const travelDay2 = await prisma.travelDay.create({
    data: {
      day: 2,
      date: new Date('2023-07-02'),
      travelPlanId: travelPlan1.id,
    },
  });

  // Seed Activities
  await prisma.activity.create({
    data: {
      travelDayId: travelDay1.id,
      destinationId: destination1.id,
    },
  });

  await prisma.activity.create({
    data: {
      travelDayId: travelDay2.id,
      destinationId: destination2.id,
    },
  });

  //  eslint-disable-next-line no-console
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    //  eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
