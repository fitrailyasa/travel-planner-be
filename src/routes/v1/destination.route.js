const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const destinationValidation = require('../../validations/destination.validation');
const destinationController = require('../../controllers/destination.controller');

const router = express.Router();

router
  .route('/')
  .post(auth(), validate(destinationValidation.createDestination), destinationController.createDestination)
  .get(auth(), destinationController.getAllDestination);

router
  .route('/:destinationId')
  .get(auth(), validate(destinationValidation.getDeleteDestinationById), destinationController.getDestinationById)
  .patch(
    auth('manageDestination'),
    validate(destinationValidation.updateDestination),
    destinationController.updateDestination
  )
  .delete(
    auth('manageDestination'),
    validate(destinationValidation.getDeleteDestinationById),
    destinationController.deleteDestination
  );

module.exports = router;
