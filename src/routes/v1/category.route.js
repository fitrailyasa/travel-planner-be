const express = require('express');
const auth = require('../../middlewares/auth');
// const validate = require('../../middlewares/validate');
// const userValidation = require('../../validations/user.validation');
const categoryController = require('../../controllers/category.controller');

const router = express.Router();

router.route('/').post(categoryController.createCategory).get(categoryController.getAllCategory);

router
  .route('/:categoryId')
  .get(categoryController.getCategoryById)
  .patch(categoryController.updateCategory)
  .delete(categoryController.deleteCategory);

router.route('/:categoryId/destinations/').get(categoryController.getDestinationByCategory);

module.exports = router;
