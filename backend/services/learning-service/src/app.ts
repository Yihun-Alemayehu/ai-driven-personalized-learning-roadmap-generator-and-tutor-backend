import express from 'express';
import pinoHttp from 'pino-http';
import { errorHandler } from './middleware/errorHandler';
import { setupSwagger } from './docs/swagger';
import healthRouter from './routes/health';
import domainsRouter from './modules/domains/domains.routes';
import ontologyRouter from './modules/ontology/ontology.routes';
import enrollmentsRouter from './modules/enrollments/enrollments.routes';
import progressRouter from './modules/progress/progress.routes';
import quizzesRouter from './modules/quizzes/quizzes.routes';
import resourcesRouter from './modules/resources/resources.routes';
import whitelistRouter from './modules/whitelist/whitelist.routes';
import decayRouter from './modules/decay/decay.routes';
import notificationsRouter from './modules/notifications/notifications.routes';
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
app.use('/api/v1', quizzesRouter);
app.use('/api/v1', resourcesRouter);
app.use('/api/v1', whitelistRouter);
app.use('/api/v1', decayRouter);
app.use('/api/v1', notificationsRouter);

app.use(errorHandler);

export default app;
