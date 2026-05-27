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
import aiRouter from './modules/ai/ai.routes';
import logger from './utils/logger';

const app = express();

app.use(securityHeaders);
app.use(corsOptions);
// Disable gzip for SSE routes — compression buffers the stream and prevents real-time delivery
app.use(compression({
  filter: (req, res) =>
    req.path.endsWith('/stream') ? false : compression.filter(req, res),
}));
app.use(express.json({ limit: '512kb' }));
app.use(inputSanitizer);
app.use(pinoHttp({ logger }));
app.use(globalLimiter);

setupSwagger(app);

app.use('/api/v1', healthRouter);
app.use('/api/v1/ai', aiRouter);

app.use(errorHandler);

export default app;
