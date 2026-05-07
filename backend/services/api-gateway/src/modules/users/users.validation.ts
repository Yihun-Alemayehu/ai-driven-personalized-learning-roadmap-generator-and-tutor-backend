import Joi from 'joi';

export const updateMeSchema = Joi.object({
  fullName: Joi.string().min(1).max(255),
  avatarUrl: Joi.string().uri().max(2048).allow(null),
  preferredLanguage: Joi.string().length(2).lowercase(),
}).min(1);

export const listUsersSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  role: Joi.string().valid('learner', 'instructor', 'admin', 'domain_expert'),
});
