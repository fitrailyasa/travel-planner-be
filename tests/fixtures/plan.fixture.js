const { v4 } = require('uuid');
const { faker } = require('@faker-js/faker');
const prisma = require('../../prisma/client');
const { userOne } = require('./user.fixture');

const plan = {
  id: v4(),
  name: 'plan one',
  city: faker.location.city(),
  travelCompanion: 'keluarga',
  budget: faker.number.int({ min: 100000, max: 10000000 }),
  travelTheme: faker.helpers.arrayElement(['Kuliner', 'Eksplorasi']),
  startDate: faker.date.future(), // Jangan diubah ke string
  endDate: faker.date.future({ years: 1 }),
  userId: userOne.id, // Pastikan userId valid
};

const insertPlans = async (plans) => {
  await prisma.travelPlan.createMany({
    data: plans,
    skipDuplicates: true,
  });
};

module.exports = {
  plan,
  insertPlans,
};
