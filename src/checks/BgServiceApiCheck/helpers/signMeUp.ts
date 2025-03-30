import {
  BgNodeClient,
  CachePolicy,
  MyUser, MyUserChanges,
  SignUpUserInput,
} from '@baragaun/bg-node-client';

import appLogger from '../../../helpers/logger.js';
import { BgServiceApiCheck } from '../BgServiceApiCheck.js';
import { signMeOut } from './signMeOut.js';
import { verifyUserProps } from './verifyUserProps.js';
import { generateUserProps } from './generateUserProps.js';

const logger = appLogger.child({ scope: 'BgServiceApiCheck' });

export const signMeUp = async (
  props: Partial<MyUserChanges>,
  signOut: boolean,
  bgNodeClient: BgNodeClient,
  check: BgServiceApiCheck,
): Promise<MyUser | null> => {
  logger.debug('BgServiceApiCheck.createMyUser: calling API/signUpUser',
    { props });

  props = generateUserProps(check, props);

  const input: SignUpUserInput = {
    firstName: props.firstName!,
    lastName: props.lastName!,
    userHandle: props.userHandle!,
    email: props.email!,
    password: props.newPassword!,
    source: props.source!,
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

  const response = await bgNodeClient.operations.myUser.findMyUser({
    cachePolicy: CachePolicy.cache,
  });
  const myUser = response.object;

  if (response.error) {
    logger.error('BgServiceApiCheck.signMeUp: findMyUser returned an error',
      { response });
    check.setOffline('#04-06: findMyUser returned an error');
    return null;
  }

  if (!myUser) {
    check.setOffline('#04-07: findMyUser returned null');
    return null;
  }

  const { errors } = verifyUserProps(
    myUser as Partial<MyUser>,
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
    check.setOffline(`#04-08: verifyUserProps failed: ${errors?.join(', ')}`);
    return null;
  }

  if (signOut) {
    await signMeOut(bgNodeClient, check);
  }

  return myUser;
};
