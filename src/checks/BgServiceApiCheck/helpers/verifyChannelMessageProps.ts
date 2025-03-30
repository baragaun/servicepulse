import { ChannelMessage } from '@baragaun/bg-node-client';

export interface VerifyChannelMessageResult {
  errors?: string[];
}

export const verifyChannelMessageProps = (
  user: Partial<ChannelMessage>,
  target: Partial<ChannelMessage>,
): VerifyChannelMessageResult => {
  const errors: string[] = [];
  for (const key in target) {
    if (target[key as keyof ChannelMessage] !== user[key as keyof ChannelMessage]) {
      errors.push(`${key} does not match`);
    }
  }

  return errors.length > 0 ? { errors } : {};
};
