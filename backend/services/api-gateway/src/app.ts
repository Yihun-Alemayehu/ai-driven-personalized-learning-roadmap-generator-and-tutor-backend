import express from 'express';
import { errorHandler } from './middleware/errorHandler';
import { globalLimiter } from './middleware/rateLimiter';
import { requestLogger } from './middleware/requestLogger';
import { setupSwagger } from './docs/swagger';
import healthRouter from './routes/health';

const app = express();

app.use(express.json());
app.use(requestLogger);
app.use(globalLimiter);

setupSwagger(app);

app.use('/api/v1', healthRouter);

app.use(errorHandler);

export default app;
