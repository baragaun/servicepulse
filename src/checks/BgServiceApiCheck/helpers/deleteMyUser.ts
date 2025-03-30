import { BgNodeClient } from '@baragaun/bg-node-client';

import appLogger from '../../../helpers/logger.js';
import { BgServiceApiCheck } from '../BgServiceApiCheck.js';

const logger = appLogger.child({ scope: 'BgServiceApiCheck' });

export const deleteMyUser = async (
  bgNodeClient: BgNodeClient,
  check: BgServiceApiCheck,
): Promise<boolean> => {

  logger.debug('BgServiceApiCheck.deleteMyUser: calling API/deleteMyUser',
    { userId: bgNodeClient.myUserId });

  const deleteMyUserResponse = await bgNodeClient.operations.myUser.deleteMyUser(
    undefined,
    undefined,
    true,
  );

  logger.debug('BgServiceApiCheck.deleteMyUser: received response', { deleteMyUserResponse });

  if (deleteMyUserResponse.error) {
    return check.setOffline('#01-01: deleteMyUser returned an error');
  }

  return true;
};
