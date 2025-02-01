const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createDestination = {
  body: Joi.object().keys({
    placeName: Joi.string().required(),
    description: Joi.string().required(),
    address: Joi.string().required(),
    categoryId: Joi.required().custom(objectId),
  }),
};

const getDeleteDestinationById = {
  params: Joi.object().keys({
    destinationId: Joi.required().custom(objectId),
  }),
};

const updateDestination = {
  body: Joi.object().keys({
    placeName: Joi.string().optional(),
    description: Joi.string().optional(),
    address: Joi.string().optional(),
    categoryId: Joi.optional().custom(objectId),
  }),
};

module.exports = {
  createDestination,
  getDeleteDestinationById,
  updateDestination,
};
