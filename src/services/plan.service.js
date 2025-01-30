const httpStatus = require('http-status');
const prisma = require('../../prisma/client');
const ApiError = require('../utils/ApiError');

const createPlan = async (body, userId) => {
  body.startDate = new Date(body.startDate);
  body.endDate = new Date(body.endDate);

  const days = Math.ceil((body.endDate - body.startDate) / (1000 * 60 * 60 * 24)) + 1;

  const plan = await prisma.travelPlan.create({
    data: {
      userId: userId,
      ...body,
    },
  });

  const planDay = Array.from({ length: days }, (_, index) => ({
    day: index + 1,
    date: new Date(new Date(body.startDate).setDate(body.startDate.getDate() + index)),
    travelPlanId: plan.id,
  }));

  await prisma.travelDay.createMany({
    data: planDay,
  });

  return plan;
};

const getAllPlan = async () => {
  return await prisma.travelPlan.findMany({
    include: {
      travelDay: {
        include: {
          activities: true,
        },
      },
    },
  });
};

const getPlanById = async (planId) => {
  const plan = await prisma.travelPlan.findUnique({
    where: {
      id: planId,
    },
  });

  if (!plan) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Plan not found');
  }

  return plan;
};

const deletePlan = async (plantId) => {
  return await prisma.travelPlan.delete({
    where: {
      id: plantId,
    },
  });
};

module.exports = {
  createPlan,
  getAllPlan,
  getPlanById,
  deletePlan,
};
