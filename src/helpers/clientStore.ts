import {
  AppEnvironment,
  BgNodeClient,
  BgNodeClientConfig,
  ClientInfo,
  ClientInfoStoreType,
  HttpHeaderName,
} from '@baragaun/bg-node-client';

let _client: BgNodeClient | undefined = undefined;
let _clientInfo: ClientInfo | undefined = undefined;

const getBgNodeClient = async (
  fsdataApiUrl: string,
  createNew = false,
): Promise<BgNodeClient> => {
  if (createNew || _client) {
    _client = undefined;
  }

  if (createNew || !_client) {
    const config: BgNodeClientConfig = {
      appEnvironment: AppEnvironment.test,
      inBrowser: false,
      clientInfoStore: {
        type: ClientInfoStoreType.delegated,
        delegate: {
          persist: async (info: ClientInfo): Promise<ClientInfo> => {
            _clientInfo = info;

            return info;
          },
          load: async (): Promise<ClientInfo> => {
            return _clientInfo || {
              id: 'default',
              createdAt: new Date().toISOString(),
            };
          },
        },
      },
      fsdata: {
        url: fsdataApiUrl,
        headers: {
          [HttpHeaderName.consumer]: 'servicepulse',
        },
      },
    };
    _client = await new BgNodeClient().init(config);
  }

  return _client;
};

const clientStore = {
  clearClientInfo: (): void => {
    _clientInfo = undefined;
  },
  getBgNodeClient,
};

export default clientStore;
