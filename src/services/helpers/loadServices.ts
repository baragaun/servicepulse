// import fs from 'fs';
import * as fs from 'node:fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

import serviceFactory from './serviceFactory.js';
import appStore from '../../appStore.js'
import logger from '../../helpers/logger.js'
import { BaseServiceConfig } from '../../types/index.js'
import { BaseService } from '../BaseService.js';

const __filename = fileURLToPath(import.meta.url);
const _curDir = dirname(__filename);

const loadServices = async (): Promise<Map<string, BaseService>> => {
  try {
    const configDirPath = path.join(_curDir, '../../../config');
    const files = await fs.promises.readdir(configDirPath);

    for (const file of files) {
      if (file.endsWith('.json')) {
        const jsonFilePath = path.join(configDirPath, file);
        logger.info(`loadServices: Found service config file: ${jsonFilePath}`);

        const data = await fs.promises.readFile(jsonFilePath, 'utf-8');
        const serviceConfig = JSON.parse(data) as BaseServiceConfig;

        const service = serviceFactory(serviceConfig);

        if (!service) {
          logger.error(`loadServices: Failed to create service for ${serviceConfig.name}`);
          continue;
        }

        appStore.setService(service);
      }
    }

    return appStore.services();
  } catch (error) {
    logger.error('Error reading or parsing the JSON file:', error);
    throw error;
  }
}

export default loadServices;
