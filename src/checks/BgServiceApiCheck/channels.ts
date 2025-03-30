import { BgNodeClient } from '@baragaun/bg-node-client';

import { BgServiceApiCheck } from './BgServiceApiCheck.js';
import { ServiceHealth } from '../../enums.js';
import { createChannelInvitation } from './helpers/createChannelInvitation.js';
import { createMultipleUsers } from './helpers/createMultipleUsers.js';
import { deleteMultipleUsers } from './helpers/deleteMultipleUsers.js';
import chance from '../../helpers/chance.js';
import appLogger from '../../helpers/logger.js';

const logger = appLogger.child({ scope: 'BgServiceApiCheck' });

export const channelsCheck = async (
  bgNodeClient: BgNodeClient,
  check: BgServiceApiCheck,
): Promise<boolean> => {
  // ...........................................................................
  // Creating users:
  const users = await createMultipleUsers(
    2,
    bgNodeClient,
    check,
  );

  if (!users) {
    return check.setOffline('#06-01: createMultipleUsers failed');
  }

  // ...........................................................................
  // User #1 invites user #2:
  const invitation = await createChannelInvitation({
    recipientId: users[0].id as string,
    createdBy: users[1].id as string,
    messageText: chance.sentence(),
  }, bgNodeClient, check);

  if (!invitation) {
    return check.setOffline('#06-03: createChannelInvitation failed');
  }

  // ...........................................................................
  // Deleting all users:
  if (!await deleteMultipleUsers(users, bgNodeClient, check)) {
    return check.setOffline('#06-50: deleteMultipleUsers failed');
  }

  check.health = ServiceHealth.ok;
  check.reason = '';
  check.running = false;
  logger.debug('BgServiceApiCheck.channelsCheck: successfully finished.');

  check.service.onCheckFinished();

  return true;
};
