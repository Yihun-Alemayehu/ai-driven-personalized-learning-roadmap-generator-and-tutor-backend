import Joi from 'joi';

export const enrollSchema = Joi.object({
  domainId: Joi.string().uuid().required(),
  selectedBranchPath: Joi.string().valid('frontend', 'backend', 'data_science').optional(),
});
