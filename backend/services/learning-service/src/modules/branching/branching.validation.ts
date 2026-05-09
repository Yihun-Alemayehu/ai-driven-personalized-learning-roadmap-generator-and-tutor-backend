import Joi from 'joi';

const VALID_BRANCH_PATHS = ['frontend', 'backend', 'data_science'];

export const selectPathSchema = Joi.object({
  branchPath: Joi.string()
    .valid(...VALID_BRANCH_PATHS)
    .required()
    .messages({
      'any.only': `branchPath must be one of: ${VALID_BRANCH_PATHS.join(', ')}`,
    }),
});
