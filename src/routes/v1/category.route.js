const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const categoryValidation = require('../../validations/category.validation');
const categoryController = require('../../controllers/category.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('manageCategory'), validate(categoryValidation.createCategory), categoryController.createCategory)
  .get(auth(), categoryController.getAllCategory);

router
  .route('/:categoryId')
  .get(auth(), validate(categoryValidation.getDeleteCategoryById), categoryController.getCategoryById)
  .patch(auth('manageCategory'), validate(categoryValidation.updateCategory), categoryController.updateCategory)
  .delete(auth('manageCategory'), validate(categoryValidation.getDeleteCategoryById), categoryController.deleteCategory);

router
  .route('/:categoryId/destinations/')
  .get(auth(), validate(categoryValidation.getDeleteCategoryById), categoryController.getDestinationByCategory);

module.exports = router;
