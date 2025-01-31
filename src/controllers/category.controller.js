const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { categoryService } = require('../services');

const createCategory = catchAsync(async (req, res) => {
  const result = await categoryService.createCategory(req.body);

  res.status(httpStatus.CREATED).send({
    status: httpStatus.CREATED,
    message: 'Create Category Success',
    data: result,
  });
});

const getAllCategory = catchAsync(async (req, res) => {
  const result = await categoryService.getAllCategory();

  res.status(httpStatus.OK).send({
    status: httpStatus.OK,
    message: 'Get All Category Success',
    data: result,
  });
});

const getDestinationByCategory = catchAsync(async (req, res) => {
  const result = await categoryService.getDestinationByCategory(req.params.categoryId);

  res.status(httpStatus.OK).send({
    status: httpStatus.OK,
    message: 'Get Destination by Category Success',
    data: result,
  });
});

const getCategoryById = catchAsync(async (req, res) => {
  const result = await categoryService.getCategoryById(req.params.categoryId);

  res.status(httpStatus.OK).send({
    status: httpStatus.OK,
    message: 'Get Category by Id Success',
    data: result,
  });
});

const updateCategory = catchAsync(async (req, res) => {
  const result = await categoryService.updateCategory(req.body, req.params.categoryId);

  res.status(httpStatus.OK).send({
    status: httpStatus.OK,
    message: 'Update Category Success',
    data: result,
  });
});

const deleteCategory = catchAsync(async (req, res) => {
  const result = await categoryService.deleteCategory(req.params.categoryId);

  res.status(httpStatus.OK).send({
    status: httpStatus.OK,
    message: 'Delete Category Success',
    data: result,
  });
});
module.exports = {
  createCategory,
  getAllCategory,
  getDestinationByCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
