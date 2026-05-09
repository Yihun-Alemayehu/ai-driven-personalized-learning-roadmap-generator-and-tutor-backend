import app from './app';
import config from './config';
import logger from './utils/logger';
import { startDecayScheduler } from './modules/decay/decay.scheduler';

app.listen(config.port, () => {
  logger.info({ port: config.port }, 'learning-service started');
  startDecayScheduler();
});
