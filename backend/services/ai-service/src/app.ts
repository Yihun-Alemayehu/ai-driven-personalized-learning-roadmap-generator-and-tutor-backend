import express from 'express';
import pinoHttp from 'pino-http';
import { errorHandler } from './middleware/errorHandler';
import { setupSwagger } from './docs/swagger';
import healthRouter from './routes/health';
import logger from './utils/logger';

const app = express();

app.use(express.json());
app.use(pinoHttp({ logger }));

setupSwagger(app);

app.use('/api/v1', healthRouter);

app.use(errorHandler);

export default app;
