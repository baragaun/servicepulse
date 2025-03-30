import { MyUser } from '@baragaun/bg-node-client';

import chance, { uniqueEmail, uniqueUserHandle } from '../../../helpers/chance.js';
import { BgServiceApiCheck } from '../BgServiceApiCheck.js';

export const generateUserProps = (
  check: BgServiceApiCheck,
  props?: Partial<MyUser>,
): Partial<MyUser> => {
  const adminNotes = props?.adminNotes ||
    JSON.stringify({ password: chance.string({ length: 8 }) });

  return {
    firstName: props?.firstName || chance.first(),
    lastName: props?.lastName || chance.last(),
    userHandle: props?.userHandle || uniqueUserHandle(),
    email: props?.email || uniqueEmail(
      check.config.testEmailPrefix || 'test',
      check.config.testEmailDomain || 'test.com',
    ),
    adminNotes,
    source: props?.source || 'testtoken=666666',
  };
};
