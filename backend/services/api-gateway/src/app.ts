import express from 'express';
import compression from 'compression';
import { errorHandler } from './middleware/errorHandler';
import { globalLimiter, authLimiter } from './middleware/rateLimiter';
import { requestLogger } from './middleware/requestLogger';
import { securityHeaders } from './middleware/helmet';
import { corsOptions } from './middleware/cors';
import { inputSanitizer } from './middleware/inputSanitizer';
import { setupSwagger } from './docs/swagger';
import healthRouter from './routes/health';
import authRouter from './modules/auth/auth.routes';
import usersRouter from './modules/users/users.routes';
import adminRouter from './modules/admin/admin.routes';

const app = express();

app.use(securityHeaders);
app.use(corsOptions);
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(inputSanitizer);
app.use(requestLogger);
app.use(globalLimiter);

setupSwagger(app);

app.use('/api/v1', healthRouter);
app.use('/api/v1/auth', authLimiter, authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/admin', adminRouter);

app.use(errorHandler);

export default app;
