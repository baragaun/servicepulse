import {
  AppEnvironment,
  BgNodeClient,
  BgNodeClientConfig,
  ClientInfoStore,
  ClientInfoStoreType,
  HttpHeaderName,
} from '@baragaun/bg-node-client';

import logger from './logger.js';

let _client: BgNodeClient | undefined = undefined;
const _clientInfoStore = new ClientInfoStore(ClientInfoStoreType.inMemory);

const getBgNodeClient = async (
  fsdataApiUrl: string,
  createNew = false,
): Promise<BgNodeClient> => {
  if (createNew && _client) {
    logger.debug('getBgNodeClient: Closing existing client before creating a new one.');
    _client.close();
  }

  if (createNew || !_client) {
    const config: BgNodeClientConfig = {
      appEnvironment: AppEnvironment.test,
      inBrowser: false,
      clientInfoStore: _clientInfoStore,
      fsdata: {
        url: fsdataApiUrl,
        headers: {
          [HttpHeaderName.consumer]: 'servicepulse',
        },
      },
      logLevel: 'debug',
    };
    _client = await new BgNodeClient().init(
      config,
      undefined,
      undefined,
      logger.child({ scope: 'BgNodeClient' }),
    );
  }

  return _client;
};

const clientStore = {
  getBgNodeClient,
};

export default clientStore;
