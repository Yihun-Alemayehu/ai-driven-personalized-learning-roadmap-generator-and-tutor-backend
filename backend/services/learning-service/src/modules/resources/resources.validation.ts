import Joi from 'joi';

export const createResourceSchema = Joi.object({
  nodeId: Joi.string().uuid().required(),
  title: Joi.string().max(500).required(),
  url: Joi.string().uri().required(),
  sourceDomain: Joi.string().max(255).required(),
  modality: Joi.string()
    .valid('documentation', 'tutorial', 'video', 'interactive', 'reference')
    .required(),
  description: Joi.string().max(2000).optional(),
  isPrimary: Joi.boolean().default(false),
});

export const updateResourceSchema = Joi.object({
  title: Joi.string().max(500),
  url: Joi.string().uri(),
  modality: Joi.string().valid('documentation', 'tutorial', 'video', 'interactive', 'reference'),
  description: Joi.string().max(2000).allow(''),
  isPrimary: Joi.boolean(),
}).min(1);

export const rateResourceSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().max(1000).optional().allow(''),
});
