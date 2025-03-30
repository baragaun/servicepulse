import { BgNodeClient, MyUser } from '@baragaun/bg-node-client';

import { BgServiceApiCheck } from '../BgServiceApiCheck.js';
import { deleteMyUser } from './deleteMyUser.js';
import { signMeIn } from './signMeIn.js';
import logger from '../../../helpers/logger.js';
import getTestUserProps from '../../../helpers/getTestUserProps.js';

export const deleteMultipleUsers = async (
  users: MyUser[],
  bgNodeClient: BgNodeClient,
  check: BgServiceApiCheck,
): Promise<boolean> => {
  if (bgNodeClient?.isSignedIn) {
    return check.setOffline('#10-01: do not be signed in for deleteMultipleUsers.');
  }

  for (let i = 0; i < 2; i++) {
    const signInResult = await signMeIn(
      users[i].email as string,
      getTestUserProps(users[i]).password!,
      bgNodeClient,
      check,
    );
    if (!signInResult) {
      check.setOffline(`#10-02: signMeIn failed for user${i}`);
    }
    logger.debug('Deleting user', { userId: users[i].id });
    if (!await deleteMyUser(bgNodeClient, check)) {
      return check.setOffline(`#10-03: deleteMyUser failed for user${i}`);
    }
  }

  return true;
};
