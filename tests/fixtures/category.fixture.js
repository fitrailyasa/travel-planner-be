const { v4 } = require('uuid');
const prisma = require('../../prisma/client');

const category = {
  id: v4(),
  name: 'Category One',
  imageUrl: 'https://example.com/category-one.jpg',
};

const insertCategories = async (categories) => {
  await prisma.category.createMany({
    data: categories,
    skipDuplicates: true,
  });
};

module.exports = {
  category,
  insertCategories,
};
