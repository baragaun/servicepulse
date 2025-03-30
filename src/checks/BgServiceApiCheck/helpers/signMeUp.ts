import {
  BgNodeClient,
  CachePolicy,
  MyUser,
  SignUpUserInput,
} from '@baragaun/bg-node-client';

import chance, { uniqueEmail, uniqueUserHandle } from '../../../helpers/chance.js';
import appLogger from '../../../helpers/logger.js';
import { BgServiceApiCheck } from '../BgServiceApiCheck.js';
import { UserProps } from '../types.js';
import { signMeOut } from './signMeOut.js';
import { verifyUserProps } from './verifyUserProps.js';

const logger = appLogger.child({ scope: 'BgServiceApiCheck' });

export const signMeUp = async (
  props: UserProps,
  signOut: boolean,
  bgNodeClient: BgNodeClient,
  check: BgServiceApiCheck,
): Promise<MyUser | null> => {
  logger.debug('BgServiceApiCheck.createMyUser: calling API/signUpUser',
    { props });

  const input: SignUpUserInput = {
    firstName: props?.firstName || chance.first(),
    lastName: props?.lastName || chance.last(),
    userHandle: props?.userHandle || uniqueUserHandle(),
    email: props?.email || uniqueEmail(
      check.config.testEmailPrefix || 'test',
      check.config.testEmailDomain || 'test.com',
    ),
    password: props?.password || chance.word(),
    source: props?.source || 'testtoken=666666',
    isTestUser: true,
  }

  const signUpUserAuthResponse = await bgNodeClient.operations.myUser.signUpUser(input);

  logger.debug('BgServiceApiCheck.signMeUp: received signUpUser response',
    { signUpUserAuthResponse });

  if (signUpUserAuthResponse.error) {
    logger.error('BgServiceApiCheck.userAccountsCheck: signUpUser returned an error',
      { error: signUpUserAuthResponse.error });
    check.setOffline('#04-01: signUpUser: error');
    return null;
  }

  const authResponse = signUpUserAuthResponse.object?.userAuthResponse;

  if (!authResponse) {
    logger.error('BgServiceApiCheck.signMeUp: authResponse is not defined',
      { signUpUserAuthResponse });
    check.setOffline('#04-02: signUpUser: error');
    return null;
  }

  const myUserId = authResponse.userId;

  if (!myUserId) {
    check.setOffline('#04-03: myUserId is undefined');
    return null;
  }

  if (!authResponse.authToken) {
    check.setOffline('#04-04: authResponse.authToken is undefined');
    return null;
  }

  const clientInfo1 = await bgNodeClient?.clientInfoStore.load();
  if (!clientInfo1.myUserId || !clientInfo1.authToken || !clientInfo1.myUserDeviceUuid) {
    check.setOffline('#04-05: clientInfo1 invalid');
    return null;
  }

  const myUser = await bgNodeClient.operations.myUser.findMyUser({
    cachePolicy: CachePolicy.cache,
  });

  if (!myUser) {
    check.setOffline('#04-06: findMyUser returned null');
    return null;
  }

  const { errors } = verifyUserProps(
    myUser as Partial<UserProps>,
    {
      firstName: input.firstName,
      lastName: input.lastName,
      userHandle: input.userHandle,
      email: input.email,
      source: input.source,
    },
  );

  if (errors && errors.length > 0) {
    logger.error('BgServiceApiCheck.updateMyUser: verifyUserProps failed',
      { errors });
    check.setOffline(`#04-07: verifyUserProps failed: ${errors?.join(', ')}`);
    return null;
  }

  if (signOut) {
    await signMeOut(bgNodeClient, check);
  }

  return myUser;
};
