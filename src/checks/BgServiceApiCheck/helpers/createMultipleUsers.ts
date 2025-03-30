import { BgNodeClient, MyUser } from '@baragaun/bg-node-client';

import { BgServiceApiCheck } from '../BgServiceApiCheck.js';
import { signMeUp } from './signMeUp.js';
import { UserProps } from '../types.js';
import { generateUserProps } from './generateUserProps.js';

export const createMultipleUsers = async (
  props: UserProps[] | number,
  bgNodeClient: BgNodeClient,
  check: BgServiceApiCheck,
): Promise<MyUser[] | null> => {
  const users: MyUser[] = [];

  if (!Array.isArray(props)) {
    props = Array.from({ length: props }, () => generateUserProps(check));
  }

  for (let i = 0; i < 2; i++) {
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
    user.adminNotes = props[i].password;
    users.push(user);
  }

  return users;
};
