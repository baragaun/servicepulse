import { BgNodeClient } from '@baragaun/bg-node-client';

import { BgServiceApiCheck } from './BgServiceApiCheck.js';
import { ServiceHealth } from '../../enums.js';
import { createChannelInvitation } from './helpers/createChannelInvitation.js';
import { createMultipleUsers } from './helpers/createMultipleUsers.js';
import { deleteMultipleUsers } from './helpers/deleteMultipleUsers.js';
import chance from '../../helpers/chance.js';
import appLogger from '../../helpers/logger.js';
import { signMeIn } from './helpers/signMeIn.js';
import getTestUserProps from '../../helpers/getTestUserProps.js';
import { signMeOut } from './helpers/signMeOut.js';

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
    return check.setOffline('#c1-01: createMultipleUsers failed');
  }

  const passwords = users.map(u => getTestUserProps(u).password || '');

  // ...........................................................................
  // Signing in as user #1:
  if (!await signMeIn(users[0].email as string, passwords[0] as string, bgNodeClient, check)) {
    return check.setOffline('#c1-02: signMeIn failed');
  }

  // ...........................................................................
  // User #1 invites user #2:
  const invitation = await createChannelInvitation({
    recipientId: users[0].id as string,
    createdBy: users[1].id as string,
    messageText: chance.sentence(),
  }, bgNodeClient, check);

  if (!invitation) {
    return check.setOffline('#c1-03: createChannelInvitation failed');
  }

  // ...........................................................................
  // Sign Out:
  if (!await signMeOut(bgNodeClient, check)) {
    return check.setOffline('#c1-04: signMeOut failed');
  }

  // ...........................................................................
  // Deleting all users:
  if (!await deleteMultipleUsers(users, bgNodeClient, check)) {
    return check.setOffline('#c1-05: deleteMultipleUsers failed');
  }

  check.health = ServiceHealth.ok;
  check.reason = '';
  check.running = false;
  logger.debug('BgServiceApiCheck.channelsCheck: successfully finished.');

  check.service.onCheckFinished();

  return true;
};
