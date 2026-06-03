import express from 'express';
import compression from 'compression';
import pinoHttp from 'pino-http';
import { errorHandler } from './middleware/errorHandler';
import { globalLimiter } from './middleware/rateLimiter';
import { securityHeaders } from './middleware/helmet';
import { corsOptions } from './middleware/cors';
import { inputSanitizer } from './middleware/inputSanitizer';
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
import branchingRouter from './modules/branching/branching.routes';
import adminRouter from './modules/admin/admin.routes';
import instructorRouter from './modules/instructor/instructor.routes';
import gamificationRouter from './modules/gamification/gamification.routes';
import certificatesRouter from './modules/certificates/certificates.routes';
import logger from './utils/logger';

const app = express();

app.use(securityHeaders);
app.use(corsOptions);
// Disable gzip for SSE routes — compression buffers the stream and prevents real-time delivery
app.use(compression({
  filter: (req, res) =>
    req.path.includes('stream') ? false : compression.filter(req, res),
}));
app.use(express.json({ limit: '1mb' }));
app.use(inputSanitizer);
app.use(pinoHttp({ logger }));
app.use(globalLimiter);

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
app.use('/api/v1', branchingRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/instructor', instructorRouter);
app.use('/api/v1', gamificationRouter);
app.use('/api/v1', certificatesRouter);

app.use(errorHandler);

export default app;
