import Joi from 'joi';

export const updateMeSchema = Joi.object({
  fullName: Joi.string().min(1).max(255),
  avatarUrl: Joi.string().uri().max(2048).allow(null),
  preferredLanguage: Joi.string().length(2).lowercase(),
}).min(1);

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(8).max(72).required(),
  newPassword: Joi.string().min(8).max(72).required(),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': '"confirmPassword" must match newPassword',
  }),
});

export const listUsersSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  role: Joi.string().valid('learner', 'domain_expert', 'admin'),
});
