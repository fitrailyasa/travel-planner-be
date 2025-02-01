const httpStatus = require('http-status');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { planService } = require('../services');

const createPlan = catchAsync(async (req, res) => {
  const result = await planService.createPlan(req.body, req.user.id);

  res.status(httpStatus.CREATED).send({
    status: httpStatus.CREATED,
    message: 'Create Plan Success',
    data: result,
  });
});

const getAllPlan = catchAsync(async (req, res) => {
  const result = await planService.getAllPlan();

  res.status(httpStatus.OK).send({
    status: httpStatus.OK,
    message: 'Get Plan Success',
    data: result,
  });
});

const getPlanById = catchAsync(async (req, res) => {
  const result = await planService.getPlanById(req.params.planId);

  res.status(httpStatus.OK).send({
    status: httpStatus.OK,
    message: 'Get Plan by id Success',
    data: result,
  });
});

const deletePlan = catchAsync(async (req, res) => {
  const plan = await planService.deletePlan(req.params.planId);

  res.status(httpStatus.OK).send({
    status: httpStatus.OK,
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

const addDestinationToPlan = catchAsync(async (req, res) => {
  const result = await planService.addDestinationToPlan(req.body);

  res.status(httpStatus.CREATED).send({
    status: httpStatus.CREATED,
    message: 'Add destination success',
    data: result,
  });
});

const deleteDestinationFromPlan = catchAsync(async (req, res) => {
  const result = await planService.deleteDestinationFromPlan(req.params.activityId);

  res.status(httpStatus.OK).send({
    status: httpStatus.OK,
    message: 'Delete destination success',
    data: result,
  });
});

module.exports = {
  createPlan,
  getAllPlan,
  getPlanById,
  deletePlan,
  createItinerary,
  addDestinationToPlan,
  deleteDestinationFromPlan,
};
