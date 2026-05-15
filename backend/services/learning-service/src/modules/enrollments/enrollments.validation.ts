import Joi from 'joi';

export const enrollSchema = Joi.object({
  domainId: Joi.string().uuid().required(),
  selectedBranchPath: Joi.string().valid('frontend', 'backend', 'data_science').optional(),
  weeklyHours: Joi.number().integer().min(1).max(100).optional(),
  familiarityLevel: Joi.string().valid('beginner', 'intermediate', 'advanced').optional(),
  learningGoal: Joi.string().valid('get_job', 'upskill', 'hobby', 'certification').optional(),
  aboutSelf: Joi.string().max(1000).optional().allow(''),
});
