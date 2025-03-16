import {
  BgNodeClient,
  CachePolicy,
  UserIdentType,
} from '@baragaun/bg-node-client';

import { BgServiceApiJob } from './BgServiceApiJob.js';
import { ServiceHealth } from '../../enums.js';
import chance from '../../helpers/chance.js';
import appLogger from '../../helpers/logger.js';

const logger = appLogger.child({ scope: 'BgServiceApiJob' });

export const basicSignUp = async (
  bgNodeClient: BgNodeClient,
  job: BgServiceApiJob,
): Promise<boolean> => {
  const firstName = chance.first();
  const lastName = chance.last();
  const newLastName = chance.last();
  const userHandle = chance.word();
  const password = chance.word();
  const email = chance.email();
  const token = '666666';

  logger.debug('BgServiceApiJob.run: calling API/signUpUser',
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
    logger.error('BgServiceApiJob.run: signUpUser returned an error', { error: signUpUserAuthResponse.error });
    return job.setOffline('signUpUser: error');
  }

  const authResponse = signUpUserAuthResponse.object?.userAuthResponse;

  if (!authResponse) {
    logger.error('BgServiceApiJob.run: authResponse is not defined', { signUpUserAuthResponse });
    return job.setOffline('signUpUser: error');
  }

  const myUserId = authResponse.userId;

  if (!myUserId) {
    return job.setOffline('myUserId is undefined');
  }

  if (!authResponse.authToken) {
    return job.setOffline('authResponse.authToken is undefined');
  }

  const clientInfo1 = await bgNodeClient?.clientInfoStore.load();
  if (!clientInfo1.myUserId || !clientInfo1.authToken || !clientInfo1.myUserDeviceUuid) {
    return job.setOffline('clientInfo1 invalid');
  }

  logger.debug('BgServiceApiJob.run: calling API/signMeOut');

  await bgNodeClient.operations.myUser.signMeOut();

  const clientInfo2 = await bgNodeClient?.clientInfoStore.load();
  if (clientInfo2.myUserId || clientInfo2.authToken || !clientInfo2.myUserDeviceUuid) {
    return job.setOffline('clientInfo2 invalid');
  }

  logger.debug('BgServiceApiJob.run: calling API/signInUser');

  const signInUserResponse = await bgNodeClient.operations.myUser.signInUser({
    ident: email,
    identType: UserIdentType.email,
    password,
  });

  if (!signInUserResponse) {
    return job.setOffline('signInUserResponse is undefined');
  }

  if (signInUserResponse.error) {
    return job.setOffline('signInUser returned an error');
  }

  if (!signInUserResponse.object?.userAuthResponse?.userId) {
    return job.setOffline('signInUserResponse.object.userAuthResponse.userId is undefined');
  }

  if (!signInUserResponse.object?.userAuthResponse?.authToken) {
    return job.setOffline('signInUserResponse.object.userAuthResponse.authToken is undefined');
  }

  if (!signInUserResponse.object?.myUser?.id) {
    return job.setOffline('signInUserResponse.object.myUser.id is undefined');
  }

  const clientInfo3 = await bgNodeClient?.clientInfoStore.load();
  if (!clientInfo3.myUserId || !clientInfo3.authToken || !clientInfo3.myUserDeviceUuid) {
    return job.setOffline('clientInfo3 invalid');
  }

  logger.debug('BgServiceApiJob.run: calling API/updateMyUser');

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
    return job.setOffline('myUserFromNetwork?.id !== signInUserResponse.object?.myUser?.id');
  }

  if (myUserFromNetwork?.userHandle !== userHandle) {
    return job.setOffline('myUserFromNetwork?.userHandle !== userHandle');
  }

  if (myUserFromNetwork?.firstName !== firstName) {
    return job.setOffline('myUserFromNetwork?.firstName !== firstName');
  }

  if (myUserFromNetwork?.lastName !== newLastName) {
    return job.setOffline('myUserFromNetwork?.lastName !== newLastName');
  }

  if (myUserFromNetwork?.email !== email) {
    return job.setOffline('myUserFromNetwork?.email !== email');
  }

  logger.debug('BgServiceApiJob.run: calling API/deleteMyUser');

  const deleteMyUserResponse = await bgNodeClient.operations.myUser.deleteMyUser(undefined, undefined, true);

  if (deleteMyUserResponse.error) {
    return job.setOffline('deleteMyUser returned an error');
  }

  job.health = ServiceHealth.ok;
  job.reason = '';
  job.running = false;
  logger.debug('BgServiceApiJob.run: successfully finished.');

  job.service.onJobFinished();

  return true;
};
