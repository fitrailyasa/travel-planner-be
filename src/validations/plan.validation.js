const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createPlan = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    city: Joi.string().required(),
    travelCompanion: Joi.string().required(),
    budget: Joi.number().required(),
    travelTheme: Joi.string().required(),
    startDate: Joi.string().required(),
    endDate: Joi.string().required(),
  }),
};

const getDeletePlan = {
  params: Joi.object().keys({
    planId: Joi.optional().custom(objectId),
  }),
};

const addDestinationToPlan = {
  body: Joi.object().keys({
    destinationId: Joi.required().custom(objectId),
    travelDayId: Joi.required().custom(objectId),
  }),
};

const deleteDestinationFromPlan = {
  params: Joi.object().keys({
    activityId: Joi.required().custom(objectId),
  }),
};

module.exports = {
  createPlan,
  getDeletePlan,
  addDestinationToPlan,
  deleteDestinationFromPlan,
};
