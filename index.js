import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { plugin } from 'selenium-with-fingerprints';
import { simpleGitHubVisit } from './example.js';
import { Logger } from './src/utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logger = new Logger('Runner');

const engineDir = path.join(__dirname, 'data', 'engine');

const run = async () => {
  if (!fs.existsSync(engineDir)) {
    logger.info('Initializing browser engine...');
    const driver = await plugin.launch();
    await driver.close();
    logger.info('Browser engine downloaded successfully!');
  }

  logger.info('Starting GitHub automation...');
  await simpleGitHubVisit().catch(error => logger.error(`Automation failed: ${error.message}`));
};

await run();