const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { destinationService } = require('../services');

const createDestination = catchAsync(async (req, res) => {
  const result = await destinationService.createDestination(req.body);

  res.status(httpStatus.CREATED).send({
    status: httpStatus.CREATED,
    message: 'Create destination success',
    data: result,
  });
});

const getAllDestination = catchAsync(async (req, res) => {
  const result = await destinationService.getAllDestination();

  res.status(httpStatus.OK).send({
    status: httpStatus.OK,
    message: 'Get all destinations success',
    data: result,
  });
});

const getDestinationById = catchAsync(async (req, res) => {
  const result = await destinationService.getDestinationById(req.params.destinationId);

  res.status(httpStatus.OK).send({
    status: httpStatus.OK,
    message: 'Get destination success',
    data: result,
  });
});

const updateDestination = catchAsync(async (req, res) => {
  const result = await destinationService.updateDestination(req.body, req.params.destinationId);

  res.status(httpStatus.OK).send({
    status: httpStatus.OK,
    message: 'Update destination success',
    data: result,
  });
});

const deleteDestination = catchAsync(async (req, res) => {
  const result = await destinationService.deleteDestination(req.params.destinationId);

  res.status(httpStatus.OK).send({
    status: httpStatus.OK,
    message: 'Delete destination success',
    data: result,
  });
});

module.exports = {
  createDestination,
  getAllDestination,
  getDestinationById,
  updateDestination,
  deleteDestination,
};
