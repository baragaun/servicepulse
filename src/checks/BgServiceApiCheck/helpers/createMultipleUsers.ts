import { BgNodeClient, MyUser, MyUserChanges } from '@baragaun/bg-node-client';

import { BgServiceApiCheck } from '../BgServiceApiCheck.js';
import { signMeUp } from './signMeUp.js';
import { generateUserProps } from './generateUserProps.js';

export const createMultipleUsers = async (
  props: Partial<MyUserChanges>[] | number,
  bgNodeClient: BgNodeClient,
  check: BgServiceApiCheck,
): Promise<MyUser[] | null> => {
  const users: MyUser[] = [];

  if (!Array.isArray(props)) {
    props = Array.from({ length: props }, () => generateUserProps(check));
  }

  for (let i = 0; i < props.length; i++) {
    const user = await signMeUp(
      props[i],
      true,
      bgNodeClient,
      check,
    );
    if (!user) {
      check.setOffline(`#06-01: signMeUp failed for user${i}`);
      return null;
    }
    users.push(user);
  }

  return users;
};
