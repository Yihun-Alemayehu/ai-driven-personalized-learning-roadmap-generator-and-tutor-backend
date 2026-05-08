import Joi from 'joi';

export const submitAttemptSchema = Joi.object({
  enrollmentId: Joi.string().uuid().required(),
  answers: Joi.array()
    .items(
      Joi.object({
        questionId: Joi.string().uuid().required(),
        answer: Joi.string().min(1).required(),
      }),
    )
    .min(1)
    .required(),
  startedAt: Joi.string().isoDate().required(),
});

export const listAttemptsSchema = Joi.object({
  nodeId: Joi.string().uuid(),
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0),
});
