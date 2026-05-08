import Joi from 'joi';

export const addWhitelistSchema = Joi.object({
  sourceDomain: Joi.string().max(255).required(),
  sourceName: Joi.string().max(255).required(),
  defaultModality: Joi.string()
    .valid('documentation', 'tutorial', 'video', 'interactive', 'reference')
    .required(),
});
