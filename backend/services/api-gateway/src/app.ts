import express from 'express';
import { errorHandler } from './middleware/errorHandler';
import { globalLimiter } from './middleware/rateLimiter';
import { requestLogger } from './middleware/requestLogger';
import { setupSwagger } from './docs/swagger';
import healthRouter from './routes/health';
import authRouter from './modules/auth/auth.routes';
import usersRouter from './modules/users/users.routes';

const app = express();

app.use(express.json());
app.use(requestLogger);
app.use(globalLimiter);

setupSwagger(app);

app.use('/api/v1', healthRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);

app.use(errorHandler);

export default app;
