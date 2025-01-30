const express = require('express');
const auth = require('../../middlewares/auth');
// const validate = require('../../middlewares/validate');
// const userValidation = require('../../validations/user.validation');
const planController = require('../../controllers/plan.controller');

const router = express.Router();

router.route('/').post(auth(), planController.createPlan).get(auth(), planController.getAllPlan);

router.route('/:planId').get(auth(), planController.getPlanById).delete(auth(), planController.deletePlan);

module.exports = router;
