import { MyUser, MyUserChanges } from '@baragaun/bg-node-client';

import chance, { uniqueEmail, uniqueUserHandle } from '../../../helpers/chance.js';
import getTestUserProps from '../../../helpers/getTestUserProps.js';
import { TestUserProps } from '../../../types/TestUserProps.js';
import { BgServiceApiCheck } from '../BgServiceApiCheck.js';

export const generateUserProps = (
  check: BgServiceApiCheck,
  props?: Partial<MyUser>,
): Partial<MyUserChanges> => {
  const testUserProps: TestUserProps = props?.source
    ? getTestUserProps(props)
    : {
      msaToken: '666666',
      password: chance.string({ length: 8 }),
    };

  return {
    firstName: props?.firstName || chance.first(),
    lastName: props?.lastName || chance.last(),
    userHandle: props?.userHandle || uniqueUserHandle(),
    email: props?.email || uniqueEmail(
      check.config.testEmailPrefix || 'test',
      check.config.testEmailDomain || 'test.com',
    ),
    newPassword: testUserProps.password,
    source: props?.source || JSON.stringify(testUserProps),
  };
};
