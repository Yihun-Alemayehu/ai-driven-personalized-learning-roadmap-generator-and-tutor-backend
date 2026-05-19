import Joi from 'joi';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const createDomainSchema = Joi.object({
  name: Joi.string().max(100).required(),
  slug: Joi.string().max(100).pattern(slugPattern).optional(),
  description: Joi.string().optional(),
  iconUrl: Joi.string().uri().optional(),
});

export const updateDomainSchema = Joi.object({
  name: Joi.string().max(100),
  slug: Joi.string().max(100).pattern(slugPattern),
  description: Joi.string().allow(null, ''),
  iconUrl: Joi.string().uri().allow(null, ''),
}).min(1);
