const { v4 } = require('uuid');
const prisma = require('../../prisma/client');
const { category } = require('./category.fixture');

const destination = {
  id: v4(),
  placeName: 'Destination One',
  description: 'A great place to visit',
  address: '123 Main St',
  categoryId: category.id,
};

const insertDestinations = async (destinations) => {
  await prisma.destination.createMany({
    data: destinations,
    skipDuplicates: true,
  });
};

module.exports = {
  destination,
  insertDestinations,
};
