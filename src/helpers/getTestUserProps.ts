import logger from './logger.js';
import { TestUserProps } from '../types/TestUserProps.js';
import { MyUser } from '@baragaun/bg-node-client';

const getTestUserProps = (
  user: Partial<MyUser> | null | undefined,
): TestUserProps => {
  if (!user || !user.source) {
    return {};
  }

  try {
    return JSON.parse(user.source) as TestUserProps;
  } catch (error) {
    logger.error('getTestUserProps error:', error);
    return {};
  }
};

export default getTestUserProps;
