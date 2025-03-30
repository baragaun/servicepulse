import {
  BgNodeClient,
  CachePolicy,
  SignInInput,
  UserIdentType,
} from '@baragaun/bg-node-client';

import logger from '../../../helpers/logger.js';
import { BgServiceApiCheck } from '../BgServiceApiCheck.js';

export const signMeIn = async (
  email: string,
  password: string,
  bgNodeClient: BgNodeClient,
  check: BgServiceApiCheck,
): Promise<boolean> => {
  logger.debug('BgServiceApiCheck.signMeIn called.');

  if (bgNodeClient?.isSignedIn) {
    return check.setOffline('#02-01: already signed in');
  }

  const clientInfo1 = await bgNodeClient?.clientInfoStore.load();
  if (clientInfo1.myUserId || clientInfo1.authToken) {
    return check.setOffline('#02-02: clientInfo1 already has credentials.');
  }

  const input: SignInInput = {
    ident: email as string,
    identType: UserIdentType.email,
    password,
  };

  logger.debug('BgServiceApiCheck.signMeIn calling signInUser.', { input });

  const signInUserResponse = await bgNodeClient.operations.myUser.signInUser(input);

  logger.debug('BgServiceApiCheck.signMeIn: received response', { signInUserResponse });

  if (!signInUserResponse) {
    return check.setOffline('#02-03: signInUserResponse is undefined');
  }

  if (signInUserResponse.error) {
    return check.setOffline(`#02-04: signInUser returned an error: "${signInUserResponse.error}"`);
  }

  if (!signInUserResponse.object?.userAuthResponse?.userId) {
    return check.setOffline('#02-05: signInUserResponse.object.userAuthResponse.userId is undefined');
  }

  if (!signInUserResponse.object?.userAuthResponse?.authToken) {
    return check.setOffline('#02-06: signInUserResponse.object.userAuthResponse.authToken is undefined');
  }

  if (signInUserResponse.object?.myUser?.id !== signInUserResponse.object?.userAuthResponse?.userId) {
    return check.setOffline('#02-07: signInUserResponse.object.myUser.id is undefined');
  }

  if (!bgNodeClient.isSignedIn) {
    return check.setOffline('#02-08: bgNodeClient.isSignedIn incorrect');
  }

  if (bgNodeClient.myUserId !== signInUserResponse.object?.userAuthResponse?.userId) {
    return check.setOffline('#02-09: bgNodeClient.myUserId incorrect');
  }

  const clientInfo2 = await bgNodeClient?.clientInfoStore.load();
  if (!clientInfo2.myUserId || !clientInfo2.authToken || !clientInfo2.myUserDeviceUuid) {
    return check.setOffline('#02-10: clientInfo2 invalid');
  }

  // Verifying the local user object:
  logger.debug('BgServiceApiCheck.signMeIn: calling findMyUser.');
  const myUserFromCacheResponse = await bgNodeClient.operations.myUser.findMyUser({
    cachePolicy: CachePolicy.cache,
  });

  logger.debug('BgServiceApiCheck.signMeIn: findMyUser responded', { myUserFromCacheResponse });

  if (myUserFromCacheResponse.error) {
    logger.error('BgServiceApiCheck.signMeIn: findMyUser returned an error',
      { response: myUserFromCacheResponse });
    return check.setOffline('#02-11: findMyUser returned an error');
  }

  if (!myUserFromCacheResponse.object) {
    logger.error('BgServiceApiCheck.signMeIn: findMyUser did not return a user object',
      { response: myUserFromCacheResponse });
    return check.setOffline('#02-12: findMyUser did not return a user object');
  }

  if (myUserFromCacheResponse.object.id !== signInUserResponse.object?.userAuthResponse?.userId) {
    logger.error('BgServiceApiCheck.signMeIn: findMyUser ID mismatch.',
      { response: myUserFromCacheResponse });
    return check.setOffline('#02-13: findMyUser ID mismatch');
  }

  return true;
};
