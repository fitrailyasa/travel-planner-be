const express = require('express');
const auth = require('../../middlewares/auth');
// const validate = require('../../middlewares/validate');
// const userValidation = require('../../validations/user.validation');
const destinationController = require('../../controllers/destination.controller');

const router = express.Router();

router.route('/').post(destinationController.createDestination).get(destinationController.getAllDestination);

router
  .route('/:destinationId')
  .get(destinationController.getDestinationById)
  .patch(destinationController.updateDestination)
  .delete(destinationController.deleteDestination);

module.exports = router;
