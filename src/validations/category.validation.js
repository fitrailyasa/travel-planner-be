const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createCategory = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    imageUrl: Joi.string().required(),
  }),
};

const getDeleteCategoryById = {
  params: Joi.object().keys({
    categoryId: Joi.required().custom(objectId),
  }),
};

const updateCategory = {
  params: Joi.object().keys({
    categoryId: Joi.optional().custom(objectId),
  }),
  body: Joi.object().keys({
    name: Joi.string().optional(),
    imageUrl: Joi.string().optional(),
  }),
};

module.exports = {
  createCategory,
  getDeleteCategoryById,
  updateCategory,
};
