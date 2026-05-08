import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Learning Service',
      version: '1.0.0',
      description: 'AI-Driven Personalized Learning Roadmap Generator — Learning Service',
    },
    servers: [{ url: '/api/v1' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  // Include both src (ts-node dev) and dist (compiled container) — only existing files are scanned
  apis: [
    './src/routes/**/*.ts',
    './src/modules/**/*.ts',
    './dist/routes/**/*.js',
    './dist/modules/**/*.js',
  ],
};

const spec = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(spec));
}
