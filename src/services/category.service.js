const httpStatus = require('http-status');
const prisma = require('../../prisma/client');
const ApiError = require('../utils/ApiError');

const createCategory = async (body) => {
  return await prisma.category.create({
    data: {
      ...body,
    },
  });
};

const getAllCategory = async () => {
  return await prisma.category.findMany();
};

const getCategoryById = async (categoryId) => {
  const res = await prisma.category.findFirst({
    where: {
      id: categoryId,
    },
  });

  if (!res) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }

  return res;
};

const getDestinationByCategory = async (categoryId) => {
  await getCategoryById(categoryId);
  return await prisma.category.findFirst({
    where: {
      id: categoryId,
    },
    include: {
      destinations: true,
    },
  });
};

const updateCategory = async (body, categoryId) => {
  await getCategoryById(categoryId);

  return await prisma.category.update({
    where: {
      id: categoryId,
    },
    data: {
      ...body,
    },
  });
};

const deleteCategory = async (categoryId) => {
  await getCategoryById(categoryId);
  return await prisma.category.delete({
    where: {
      id: categoryId,
    },
  });
};

module.exports = {
  createCategory,
  getAllCategory,
  getDestinationByCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
