const httpStatus = require('http-status');
const prisma = require('../../prisma/client');
const ApiError = require('../utils/ApiError');
const { getCategoryById } = require('./category.service');

const createDestination = async (body) => {
  return await prisma.destination.create({
    data: {
      ...body,
    },
  });
};

const getAllDestination = async () => {
  return await prisma.destination.findMany();
};

const getDestinationById = async (destinationId) => {
  const destination = await prisma.destination.findFirst({
    where: {
      id: destinationId,
    },
  });

  if (!destination) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Destination not found');
  }

  return destination;
};

const updateDestination = async (body, destinationId) => {
  await getDestinationById(destinationId);
  return await prisma.destination.update({
    where: {
      id: destinationId,
    },
    data: {
      ...body,
    },
  });
};

const deleteDestination = async (destinationId) => {
  await getDestinationById(destinationId);
  return await prisma.destination.delete({
    where: {
      id: destinationId,
    },
  });
};

module.exports = {
  createDestination,
  getAllDestination,
  getDestinationById,
  updateDestination,
  deleteDestination,
};
