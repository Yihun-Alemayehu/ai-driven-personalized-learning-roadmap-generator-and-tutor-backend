import express from 'express';
import pinoHttp from 'pino-http';
import { errorHandler } from './middleware/errorHandler';
import { setupSwagger } from './docs/swagger';
import healthRouter from './routes/health';
import domainsRouter from './modules/domains/domains.routes';
import ontologyRouter from './modules/ontology/ontology.routes';
import enrollmentsRouter from './modules/enrollments/enrollments.routes';
import progressRouter from './modules/progress/progress.routes';
import logger from './utils/logger';

const app = express();

app.use(express.json());
app.use(pinoHttp({ logger }));

setupSwagger(app);

app.use('/api/v1', healthRouter);
app.use('/api/v1', domainsRouter);
app.use('/api/v1', ontologyRouter);
app.use('/api/v1', enrollmentsRouter);
app.use('/api/v1', progressRouter);

app.use(errorHandler);

export default app;
