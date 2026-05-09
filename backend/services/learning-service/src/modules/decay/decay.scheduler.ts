import { runDecayScan } from './decay.service';
import logger from '../../utils/logger';

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

export function startDecayScheduler(): NodeJS.Timeout {
  logger.info('Decay scheduler started — interval: 6 h');
  const handle = setInterval(async () => {
    logger.info('Decay scan started');
    try {
      const result = await runDecayScan();
      logger.info(result, 'Decay scan complete');
    } catch (err) {
      logger.error({ err }, 'Decay scan failed');
    }
  }, SIX_HOURS_MS);
  return handle;
}
