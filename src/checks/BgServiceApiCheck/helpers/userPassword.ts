import { MyUser } from '@baragaun/bg-node-client';

import logger from '../../../helpers/logger.js';

export const userPassword = (
  user: Partial<MyUser>,
): string | undefined => {
  if (!user || !user.adminNotes) {
    return undefined;
  }

  try {
    const json = JSON.parse(user.adminNotes);

    return json.password;
  } catch (error) {
    logger.error('userPasswordSpecHelper error:', error);
    return undefined;
  }
};
