import { ChannelInvitation } from '@baragaun/bg-node-client';

export interface VerifyChannelInvitationResult {
  errors?: string[];
}

export const verifyChannelInvitationProps = (
  user: Partial<ChannelInvitation>,
  target: Partial<ChannelInvitation>,
): VerifyChannelInvitationResult => {
  const errors: string[] = [];
  for (const key in target) {
    if (target[key as keyof ChannelInvitation] !== user[key as keyof ChannelInvitation]) {
      errors.push(`${key} does not match`);
    }
  }

  return errors.length > 0 ? { errors } : {};
};
