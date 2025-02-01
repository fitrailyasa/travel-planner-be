const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const destinationValidation = require('../../validations/destination.validation');
const destinationController = require('../../controllers/destination.controller');

const router = express.Router();

router
  .route('/')
  .post(validate(destinationValidation.createDestination), destinationController.createDestination)
  .get(destinationController.getAllDestination);

router
  .route('/:destinationId')
  .get(validate(destinationValidation.getDeleteDestinationById), destinationController.getDestinationById)
  .patch(validate(destinationValidation.updateDestination), destinationController.updateDestination)
  .delete(validate(destinationValidation.getDeleteDestinationById), destinationController.deleteDestination);

module.exports = router;
