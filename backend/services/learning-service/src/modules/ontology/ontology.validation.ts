import Joi from 'joi';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const branchPaths = ['frontend', 'backend', 'data_science'] as const;

export const createNodeSchema = Joi.object({
  title: Joi.string().max(255).required(),
  slug: Joi.string().max(255).pattern(slugPattern).required(),
  description: Joi.string().optional(),
  learningOutcomes: Joi.array().items(Joi.string()).min(1).required(),
  estimatedHours: Joi.number().precision(1).min(0).optional(),
  difficultyLevel: Joi.number().integer().min(1).max(5).optional(),
  isBranchingPoint: Joi.boolean().default(false),
  isConvergencePoint: Joi.boolean().default(false),
  branchPath: Joi.string().valid(...branchPaths).optional(),
  positionX: Joi.number().optional(),
  positionY: Joi.number().optional(),
});

export const updateNodeSchema = Joi.object({
  title: Joi.string().max(255),
  slug: Joi.string().max(255).pattern(slugPattern),
  description: Joi.string().allow(null, ''),
  learningOutcomes: Joi.array().items(Joi.string()).min(1),
  estimatedHours: Joi.number().precision(1).min(0).allow(null),
  difficultyLevel: Joi.number().integer().min(1).max(5).allow(null),
  isBranchingPoint: Joi.boolean(),
  isConvergencePoint: Joi.boolean(),
  branchPath: Joi.string().valid(...branchPaths).allow(null),
  positionX: Joi.number().allow(null),
  positionY: Joi.number().allow(null),
}).min(1);

export const importNodesSchema = Joi.object({
  nodes: Joi.array().items(
    Joi.object({
      title: Joi.string().max(255).required(),
      description: Joi.string().allow('', null).optional(),
      learningOutcomes: Joi.array().items(Joi.string()).min(1).required(),
      estimatedHours: Joi.number().precision(1).min(0).optional(),
      difficultyLevel: Joi.number().integer().min(1).max(5).optional(),
      isBranchingPoint: Joi.boolean().default(false),
      isConvergencePoint: Joi.boolean().default(false),
      branchPath: Joi.string().valid(...branchPaths).allow(null).optional(),
    }),
  ).min(1).required(),
  prerequisites: Joi.array().items(
    Joi.object({
      node: Joi.string().required(),
      requires: Joi.string().required(),
    }),
  ).default([]),
});

export const addPrerequisiteSchema = Joi.object({
  prerequisiteNodeId: Joi.string().uuid().required(),
});

export const transitionStatusSchema = Joi.object({
  status: Joi.string()
    .valid('draft', 'in_review', 'verified', 'published', 'archived')
    .required(),
});
