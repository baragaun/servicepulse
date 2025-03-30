import { BgNodeClient, CachePolicy } from '@baragaun/bg-node-client';

import appLogger from '../../../helpers/logger.js';
import { BgServiceApiCheck } from '../BgServiceApiCheck.js';
import { UserProps } from '../types.js';
import { verifyUserProps } from './verifyUserProps.js';

const logger = appLogger.child({ scope: 'BgServiceApiCheck' });

export const updateMyUser = async (
  changes: Partial<UserProps>,
  bgNodeClient: BgNodeClient,
  check: BgServiceApiCheck,
): Promise<boolean> => {
  logger.debug('BgServiceApiCheck.updateMyUser: calling API/signUpUser',
    { changes });

  logger.debug('BgServiceApiCheck.updateMyUser: calling API/updateMyUser');

  const updateUserResponse = await bgNodeClient.operations.myUser.updateMyUser(
    changes,
    { cachePolicy: CachePolicy.network },
  );

  logger.debug('BgServiceApiCheck.updateMyUser: received response from updateMyUser',
    { updateUserResponse });

  if (!updateUserResponse) {
    logger.error('BgServiceApiCheck.updateMyUser: no response from updateMyUser');
    return check.setOffline('#05-01: no response from updateMyUser');
  }

  if (updateUserResponse.error) {
    logger.error('BgServiceApiCheck.updateMyUser: no response from updateMyUser',
      { updateUserResponse });
    return check.setOffline('#05-02: updateMyUser returned error');
  }

  if (!updateUserResponse.object) {
    logger.error('BgServiceApiCheck.updateMyUser: updateMyUser returned no object',
      { updateUserResponse });
    return check.setOffline('#05-03: updateMyUser returned no object');
  }

  const { errors: errors1 } = verifyUserProps(
    updateUserResponse.object as Partial<UserProps>,
    changes,
  );

  if (errors1 && errors1.length > 0) {
    logger.error('BgServiceApiCheck.updateMyUser: verifyUserProps failed',
      { errors1 });
    return check.setOffline(`#05-04: verifyUserProps failed: ${errors1?.join(', ')}`);
  }

  // Verifying the local user object:
  const myUserFromCache = await bgNodeClient.operations.myUser.findMyUser({
    cachePolicy: CachePolicy.cache,
  });

  if (myUserFromCache?.id !== changes.id) {
    return check.setOffline('#05-05: myUserFromCache?.id !== signInUserResponse.object?.myUser?.id');
  }

  const { errors: errors2 } = verifyUserProps(
    updateUserResponse.object as Partial<UserProps>,
    changes,
  );

  if (errors2 && errors2.length > 0) {
    logger.error('BgServiceApiCheck.updateMyUser: verifyUserProps failed',
      { errors2 });
    return check.setOffline(`#05-06: verifyUserProps failed: ${errors2?.join(', ')}`);
  }

  // Verifying the remote user object:
  const myUserFromNetwork = await bgNodeClient.operations.myUser.findMyUser({
    cachePolicy: CachePolicy.network,
  });

  if (myUserFromNetwork?.id !== changes.id) {
    return check.setOffline('#05-07: myUserFromNetwork?.id !== signInUserResponse.object?.myUser?.id');
  }

  const { errors: errors3 } = verifyUserProps(
    updateUserResponse.object as Partial<UserProps>,
    changes,
  );

  if (errors3 && errors3.length > 0) {
    logger.error('BgServiceApiCheck.updateMyUser: verifyUserProps failed',
      { errors3 });
    return check.setOffline(`#05-08: verifyUserProps failed: ${errors3?.join(', ')}`);
  }

  return true;
};
