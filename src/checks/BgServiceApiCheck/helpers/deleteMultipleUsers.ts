import { BgNodeClient, MyUser } from '@baragaun/bg-node-client';

import { BgServiceApiCheck } from '../BgServiceApiCheck.js';
import { deleteMyUser } from './deleteMyUser.js';
import { signMeIn } from './signMeIn.js';
import logger from '../../../helpers/logger.js';

export const deleteMultipleUsers = async (
  users: MyUser[],
  bgNodeClient: BgNodeClient,
  check: BgServiceApiCheck,
): Promise<boolean> => {
  for (let i = 0; i < 2; i++) {
    const signInResult = await signMeIn(
      users[i].email as string,
      users[i].adminNotes as string,
      bgNodeClient,
      check,
    );
    if (!signInResult) {
      check.setOffline(`#10-01: signMeIn failed for user${i}`);
    }
    logger.debug('Deleting user #2', { userId: users[i].id });
    if (!await deleteMyUser(bgNodeClient, check)) {
      return check.setOffline(`#10-02: deleteMyUser failed for user${i}`);
    }
  }

  return true;
};
