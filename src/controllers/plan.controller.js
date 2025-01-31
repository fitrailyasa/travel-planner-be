const httpStatus = require('http-status');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { planService } = require('../services');

const createPlan = catchAsync(async (req, res) => {
  const plan = await planService.createPlan(req.body, req.user.id);

  res.status(httpStatus.CREATED).send({
    status: httpStatus.CREATED,
    message: 'Create Plan Success',
    data: plan,
  });
});

const getAllPlan = catchAsync(async (req, res) => {
  const plan = await planService.getAllPlan();

  res.status(httpStatus.CREATED).send({
    status: httpStatus.CREATED,
    message: 'Get Plan Success',
    data: plan,
  });
});

const getPlanById = catchAsync(async (req, res) => {
  const plan = await planService.getPlanById(req.params.planId);

  res.status(httpStatus.CREATED).send({
    status: httpStatus.CREATED,
    message: 'Get Plan by id Success',
    data: plan,
  });
});

const deletePlan = catchAsync(async (req, res) => {
  const plan = await planService.deletePlan(req.params.planId);

  res.status(httpStatus.CREATED).send({
    status: httpStatus.CREATED,
    message: 'Delete Plan Success',
    data: plan,
  });
});

const createItinerary = catchAsync(async (req, res) => {
  const plan = await planService.createItinerary(req.params.planId);

  res.status(httpStatus.CREATED).send({
    status: httpStatus.CREATED,
    message: 'Create Itinerary Success',
    data: plan,
  });
});

module.exports = {
  createPlan,
  getAllPlan,
  getPlanById,
  deletePlan,
  createItinerary,
};
