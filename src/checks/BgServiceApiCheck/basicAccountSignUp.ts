import {
  BgNodeClient,
  CachePolicy,
  UserIdentType,
} from '@baragaun/bg-node-client';

import { BgServiceApiCheck } from './BgServiceApiCheck.js';
import { ServiceHealth } from '../../enums.js';
import chance, { uniqueEmail, uniqueUserHandle } from '../../helpers/chance.js';
import appLogger from '../../helpers/logger.js';

const logger = appLogger.child({ scope: 'BgServiceApiCheck' });

export const basicAccountSignUp = async (
  bgNodeClient: BgNodeClient,
  check: BgServiceApiCheck,
): Promise<boolean> => {
  const firstName = chance.first();
  const lastName = chance.last();
  const newLastName = chance.last();
  const userHandle = uniqueUserHandle();
  const password = chance.word();
  const email = uniqueEmail(
    check.config.testEmailPrefix || 'test',
    check.config.testEmailDomain || 'test.com',
  );
  const token = '666666';

  logger.debug('BgServiceApiCheck.run: calling API/signUpUser',
    { userHandle, email, password });

  const signUpUserAuthResponse = await bgNodeClient.operations.myUser.signUpUser({
    userHandle,
    firstName,
    lastName,
    email,
    password,
    isTestUser: true,
    // this causes all confirmation tokens to be set to '666666':
    source: `testtoken=${token}`,
  });
  if (signUpUserAuthResponse.error) {
    logger.error('BgServiceApiCheck.run: signUpUser returned an error', { error: signUpUserAuthResponse.error });
    return check.setOffline('signUpUser: error');
  }

  const authResponse = signUpUserAuthResponse.object?.userAuthResponse;

  if (!authResponse) {
    logger.error('BgServiceApiCheck.run: authResponse is not defined', { signUpUserAuthResponse });
    return check.setOffline('signUpUser: error');
  }

  const myUserId = authResponse.userId;

  if (!myUserId) {
    return check.setOffline('myUserId is undefined');
  }

  if (!authResponse.authToken) {
    return check.setOffline('authResponse.authToken is undefined');
  }

  const clientInfo1 = await bgNodeClient?.clientInfoStore.load();
  if (!clientInfo1.myUserId || !clientInfo1.authToken || !clientInfo1.myUserDeviceUuid) {
    return check.setOffline('clientInfo1 invalid');
  }

  logger.debug('BgServiceApiCheck.run: calling API/signMeOut');

  await bgNodeClient.operations.myUser.signMeOut();

  const clientInfo2 = await bgNodeClient?.clientInfoStore.load();
  if (clientInfo2.myUserId || clientInfo2.authToken || !clientInfo2.myUserDeviceUuid) {
    return check.setOffline('clientInfo2 invalid');
  }

  logger.debug('BgServiceApiCheck.run: calling API/signInUser');

  const signInUserResponse = await bgNodeClient.operations.myUser.signInUser({
    ident: email,
    identType: UserIdentType.email,
    password,
  });

  if (!signInUserResponse) {
    return check.setOffline('signInUserResponse is undefined');
  }

  if (signInUserResponse.error) {
    return check.setOffline('signInUser returned an error');
  }

  if (!signInUserResponse.object?.userAuthResponse?.userId) {
    return check.setOffline('signInUserResponse.object.userAuthResponse.userId is undefined');
  }

  if (!signInUserResponse.object?.userAuthResponse?.authToken) {
    return check.setOffline('signInUserResponse.object.userAuthResponse.authToken is undefined');
  }

  if (!signInUserResponse.object?.myUser?.id) {
    return check.setOffline('signInUserResponse.object.myUser.id is undefined');
  }

  const clientInfo3 = await bgNodeClient?.clientInfoStore.load();
  if (!clientInfo3.myUserId || !clientInfo3.authToken || !clientInfo3.myUserDeviceUuid) {
    return check.setOffline('clientInfo3 invalid');
  }

  logger.debug('BgServiceApiCheck.run: calling API/updateMyUser');

  await bgNodeClient.operations.myUser.updateMyUser(
    {
      id: myUserId,
      lastName: newLastName,
    },
    { cachePolicy: CachePolicy.network },
  );

  await new Promise((resolve) => setTimeout(resolve, 1000));

  const myUserFromNetwork = await bgNodeClient.operations.myUser.findMyUser({
    cachePolicy: CachePolicy.network,
  });

  if (myUserFromNetwork?.id !== signInUserResponse.object?.myUser?.id) {
    return check.setOffline('myUserFromNetwork?.id !== signInUserResponse.object?.myUser?.id');
  }

  if (myUserFromNetwork?.userHandle !== userHandle) {
    return check.setOffline('myUserFromNetwork?.userHandle !== userHandle');
  }

  if (myUserFromNetwork?.firstName !== firstName) {
    return check.setOffline('myUserFromNetwork?.firstName !== firstName');
  }

  if (myUserFromNetwork?.lastName !== newLastName) {
    return check.setOffline('myUserFromNetwork?.lastName !== newLastName');
  }

  if (myUserFromNetwork?.email !== email) {
    return check.setOffline('myUserFromNetwork?.email !== email');
  }

  logger.debug('BgServiceApiCheck.run: calling API/deleteMyUser');

  const deleteMyUserResponse = await bgNodeClient.operations.myUser.deleteMyUser(undefined, undefined, true);

  if (deleteMyUserResponse.error) {
    return check.setOffline('deleteMyUser returned an error');
  }

  check.health = ServiceHealth.ok;
  check.reason = '';
  check.running = false;
  logger.debug('BgServiceApiCheck.run: successfully finished.');

  check.service.onCheckFinished();

  return true;
};
