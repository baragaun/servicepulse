import { BgNodeClient, CachePolicy, UserIdentType } from '@baragaun/bg-node-client';

import appLogger from '../../../helpers/logger.js';
import { BgServiceApiCheck } from '../BgServiceApiCheck.js';
import { verifyUserProps } from './verifyUserProps.js';
import { UserProps } from '../types.js';

const logger = appLogger.child({ scope: 'BgServiceApiCheck' });

export const signMeIn = async (
  email: string,
  password: string,
  bgNodeClient: BgNodeClient,
  check: BgServiceApiCheck,
): Promise<boolean> => {
  logger.debug('BgServiceApiCheck.signMeIn: calling API/signInUser');

  const signInUserResponse = await bgNodeClient.operations.myUser.signInUser({
    ident: email as string,
    identType: UserIdentType.email,
    password,
  });

  logger.debug('BgServiceApiCheck.signMeIn: received response', { signInUserResponse });

  if (!signInUserResponse) {
    return check.setOffline('#02-01: signInUserResponse is undefined');
  }

  if (signInUserResponse.error) {
    return check.setOffline('#02-02: signInUser returned an error');
  }

  if (!signInUserResponse.object?.userAuthResponse?.userId) {
    return check.setOffline('#02-03: signInUserResponse.object.userAuthResponse.userId is undefined');
  }

  if (!signInUserResponse.object?.userAuthResponse?.authToken) {
    return check.setOffline('#02-04: signInUserResponse.object.userAuthResponse.authToken is undefined');
  }

  if (signInUserResponse.object?.myUser?.id !== signInUserResponse.object?.userAuthResponse?.userId) {
    return check.setOffline('#02-05: signInUserResponse.object.myUser.id is undefined');
  }

  if (!bgNodeClient.isSignedIn) {
    return check.setOffline('#02-06: bgNodeClient.isSignedIn incorrect');
  }

  if (bgNodeClient.myUserId !== signInUserResponse.object?.userAuthResponse?.userId) {
    return check.setOffline('#02-07: bgNodeClient.myUserId incorrect');
  }

  const clientInfo = await bgNodeClient?.clientInfoStore.load();
  if (!clientInfo.myUserId || !clientInfo.authToken || !clientInfo.myUserDeviceUuid) {
    return check.setOffline('#02-08: clientInfo invalid');
  }

  // Verifying the local user object:
  logger.debug('BgServiceApiCheck.signMeIn: calling findMyUser.');
  const myUserFromCache = await bgNodeClient.operations.myUser.findMyUser({
    cachePolicy: CachePolicy.cache,
  });

  logger.debug('BgServiceApiCheck.signMeIn: findMyUser responded', { myUserFromCache });

  const { errors } = verifyUserProps(
    myUserFromCache as Partial<UserProps>,
    {
      id: signInUserResponse.object?.userAuthResponse?.userId,
      firstName: signInUserResponse.object?.userAuthResponse?.firstName,
      lastName: signInUserResponse.object?.userAuthResponse?.lastName,
      email,
    },
  );

  if (errors && errors.length > 0) {
    logger.error('BgServiceApiCheck.updateMyUser: verifyUserProps failed',
      { errors });
    return check.setOffline(`#02-09: verifyUserProps failed: ${errors?.join(', ')}`);
  }

  return true;
};
