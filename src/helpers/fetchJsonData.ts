import { logger } from './logger.ts'

const fetchJsonData = async (url: string): Promise<any> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  logger.debug('Fetched JSON data:', data);

  return data;
};

export default fetchJsonData;

