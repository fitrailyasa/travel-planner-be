const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const categoryValidation = require('../../validations/category.validation');
const categoryController = require('../../controllers/category.controller');

const router = express.Router();

router
  .route('/')
  .post(validate(categoryValidation.createCategory), categoryController.createCategory)
  .get(categoryController.getAllCategory);

router
  .route('/:categoryId')
  .get(validate(categoryValidation.getDeleteCategoryById), categoryController.getCategoryById)
  .patch(validate(categoryValidation.updateCategory), categoryController.updateCategory)
  .delete(validate(categoryValidation.getDeleteCategoryById), categoryController.deleteCategory);

router
  .route('/:categoryId/destinations/')
  .get(validate(categoryValidation.getDeleteCategoryById), categoryController.getDestinationByCategory);

module.exports = router;
