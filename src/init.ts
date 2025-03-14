import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

import appStore from './appStore.ts'
import { logger } from './helpers/logger.ts'
import mailer from './helpers/mailer.ts'
import servicesFactory from "./services/servicesFactory.js";
import { ServiceConfig } from './types/index.ts'

const __filename = fileURLToPath(import.meta.url);
const _curDir = dirname(__filename);

const init = async (): Promise<void> => {
  try {
    const configDirPath = path.join(_curDir, '../config');
    const files = await fs.promises.readdir(configDirPath);

    for (const file of files) {
      if (file.endsWith('.json')) {
        const jsonFilePath = path.join(_curDir, '../config', file);
        console.log(`Found service config file: ${jsonFilePath}`);

        const data = await fs.promises.readFile(jsonFilePath, 'utf-8');
        const serviceConfig = JSON.parse(data) as ServiceConfig;

        if (serviceConfig.isBgService) {

          const service = servicesFactory(serviceConfig);
          if (!service) {
            logger.error(`Failed to create service for ${serviceConfig.name}`);
            continue;
          }
          appStore.setService(service);
        }
      }
    }

    mailer.init();
  } catch (error) {
    console.error('Error reading or parsing the JSON file:', error);
    throw error;
  }
}

export default init;
