import { BgNodeClient, MyUserChanges } from '@baragaun/bg-node-client';

import { BgServiceApiCheck } from './BgServiceApiCheck.js';
import { ServiceHealth } from '../../enums.js';
import { deleteMyUser } from './helpers/deleteMyUser.js';
import { generateUserProps } from './helpers/generateUserProps.js';
import { signMeIn } from './helpers/signMeIn.js';
import { signMeOut } from './helpers/signMeOut.js';
import { signMeUp } from './helpers/signMeUp.js';
import { updateMyUser } from './helpers/updateMyUser.js';
import chance from '../../helpers/chance.js';
import appLogger from '../../helpers/logger.js';

const logger = appLogger.child({ scope: 'BgServiceApiCheck' });

export const userAccountsCheck = async (
  bgNodeClient: BgNodeClient,
  check: BgServiceApiCheck,
): Promise<boolean> => {
  const userProps = generateUserProps(check);
  const newLastName = chance.last();

  const myUser = await signMeUp(
    userProps,
    false,
    bgNodeClient,
    check,
  );

  const myUserId = bgNodeClient.myUserId;

  if (!myUser) {
    return check.setOffline('#a1-01: signMeUp failed');
  }

  if (!await signMeOut(bgNodeClient, check)) {
    return check.setOffline('#a1-02: signMeOut failed');
  }

  if (!await signMeIn(userProps.email as string, userProps.newPassword as string, bgNodeClient, check)) {
    return check.setOffline('#a1-03: signMeIn failed');
  }

  const changes: Partial<MyUserChanges> = {
    id: myUserId,
    lastName: newLastName,
    termsAndConditionsAcceptedAt: new Date().toISOString(),
  }

  if (!await updateMyUser(changes, bgNodeClient, check)) {
    return check.setOffline('#a1-04: updateMyUser failed');
  }

  if (!await deleteMyUser(bgNodeClient, check)) {
    return check.setOffline('#a1-05: deleteMyUser failed');
  }

  check.health = ServiceHealth.ok;
  check.reason = '';
  check.running = false;
  logger.debug('BgServiceApiCheck.userAccountsCheck: successfully finished.');

  check.service.onCheckFinished();

  return true;
};
