import {
  BgNodeClient,
  CachePolicy,
  MyUser,
  MyUserChanges,
} from '@baragaun/bg-node-client';

import appLogger from '../../../helpers/logger.js';
import { BgServiceApiCheck } from '../BgServiceApiCheck.js';
import { verifyUserProps } from './verifyUserProps.js';

const logger = appLogger.child({ scope: 'BgServiceApiCheck' });

export const updateMyUser = async (
  changes: Partial<MyUserChanges>,
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
    updateUserResponse.object as Partial<MyUser>,
    changes,
  );

  if (errors1 && errors1.length > 0) {
    logger.error('BgServiceApiCheck.updateMyUser: verifyUserProps failed',
      { errors1 });
    return check.setOffline(`#05-04: verifyUserProps failed: ${errors1?.join(', ')}`);
  }

  // Verifying the local user object:
  const myUserFromCacheResponse = await bgNodeClient.operations.myUser.findMyUser({
    cachePolicy: CachePolicy.cache,
  });
  const myUserFromCache = myUserFromCacheResponse.object;

  if (myUserFromCacheResponse.error) {
    logger.error('BgServiceApiCheck.updateMyUser: received error loading myUserFromCache',
      { response: myUserFromCacheResponse })
    return check.setOffline('#05-05: received error loading myUserFromCache');
  }

  if (!myUserFromCache) {
    return check.setOffline('#05-06: no user received from cache for myUser');
  }

  if (myUserFromCache.id !== changes.id) {
    return check.setOffline('#05-07: myUserFromCache.id !== signInUserResponse.object?.myUser?.id');
  }

  const { errors: errors2 } = verifyUserProps(
    updateUserResponse.object as Partial<MyUser>,
    changes,
  );

  if (errors2 && errors2.length > 0) {
    logger.error('BgServiceApiCheck.updateMyUser: verifyUserProps failed',
      { errors2 });
    return check.setOffline(`#05-08: verifyUserProps failed: ${errors2?.join(', ')}`);
  }

  // Verifying the remote user object:
  const myUserFromNetworkResponse = await bgNodeClient.operations.myUser.findMyUser({
    cachePolicy: CachePolicy.network,
  });
  const myUserFromNetwork = myUserFromNetworkResponse.object;

  if (myUserFromNetworkResponse.error) {
    logger.error('BgServiceApiCheck.updateMyUser: received error loading myUserFromNetwork',
      { response: myUserFromNetworkResponse })
    return check.setOffline('#05-09: myUserFromNetwork?.id !== signInUserResponse.object?.myUser?.id');
  }

  if (myUserFromNetwork?.id !== changes.id) {
    return check.setOffline('#05-10: myUserFromNetwork?.id !== signInUserResponse.object?.myUser?.id');
  }

  const { errors: errors3 } = verifyUserProps(
    updateUserResponse.object as Partial<MyUser>,
    changes,
  );

  if (errors3 && errors3.length > 0) {
    logger.error('BgServiceApiCheck.updateMyUser: verifyUserProps failed',
      { errors3 });
    return check.setOffline(`#05-11: verifyUserProps failed: ${errors3?.join(', ')}`);
  }

  return true;
};
