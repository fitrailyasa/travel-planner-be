const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const planValidation = require('../../validations/plan.validation');
const planController = require('../../controllers/plan.controller');

const router = express.Router();

router
  .route('/')
  .post(auth(), validate(planValidation.createPlan), planController.createPlan)
  .get(auth(), planController.getAllPlan);

router
  .route('/:planId')
  .get(auth(), validate(planValidation.getDeletePlan), planController.getPlanById)
  .delete(auth(), validate(planValidation.getDeletePlan), planController.deletePlan);

router.route('/:planId/itinerary').post(auth(), validate(planValidation.getDeletePlan), planController.createItinerary);

router
  .route('/destination')
  .post(auth(), validate(planValidation.addDestinationToPlan), planController.addDestinationToPlan);
router
  .route('/destination/:activityId')
  .delete(validate(planValidation.deleteDestinationFromPlan), planController.deleteDestinationFromPlan);

module.exports = router;
