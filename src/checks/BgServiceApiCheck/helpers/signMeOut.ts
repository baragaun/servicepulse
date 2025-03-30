import { BgNodeClient, CachePolicy } from '@baragaun/bg-node-client';

import appLogger from '../../../helpers/logger.js';
import { BgServiceApiCheck } from '../BgServiceApiCheck.js';

const logger = appLogger.child({ scope: 'BgServiceApiCheck' });

export const signMeOut = async (
  bgNodeClient: BgNodeClient,
  check: BgServiceApiCheck,
): Promise<boolean> => {
  logger.debug('BgServiceApiCheck.signMeOut: calling API/signMeOut');

  await bgNodeClient.operations.myUser.signMeOut();

  const clientInfo = await bgNodeClient?.clientInfoStore.load();
  if (clientInfo.myUserId || clientInfo.authToken || !clientInfo.myUserDeviceUuid) {
    return check.setOffline('#03-01: clientInfo invalid');
  }

  try {
    // Verifying the local user object:
    const myUserFromCache = await bgNodeClient.operations.myUser.findMyUser({
      cachePolicy: CachePolicy.cache,
    });

    if (myUserFromCache) {
      return check.setOffline('#03-02: myUserFromCache is not null');
    }
  } catch {
    // ignore
  }

  if (bgNodeClient.isSignedIn) {
    return check.setOffline('#03-03: bgNodeClient.isSignedIn incorrect');
  }

  if (bgNodeClient.myUserId) {
    return check.setOffline('#03-04: bgNodeClient.myUserId incorrect');
  }

  return true;
};
