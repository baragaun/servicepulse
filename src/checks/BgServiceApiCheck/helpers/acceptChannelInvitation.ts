import {
  BgNodeClient,
  ChannelInvitation,
} from '@baragaun/bg-node-client';

import appLogger from '../../../helpers/logger.js';
import { BgServiceApiCheck } from '../BgServiceApiCheck.js';

const logger = appLogger.child({ scope: 'BgServiceApiCheck' });

export const acceptChannelInvitation = async (
  channelInvitationId: string,
  bgNodeClient: BgNodeClient,
  check: BgServiceApiCheck,
): Promise<ChannelInvitation | null> => {
  logger.debug('BgServiceApiCheck.acceptChannelInvitation: calling API/acceptChannelInvitation',
    { channelInvitationId });

  const response = await bgNodeClient.operations.channelInvitation.acceptChannelInvitation(
    channelInvitationId,
  );

  logger.debug('BgServiceApiCheck.acceptChannelInvitation: received acceptChannelInvitation response',
    { response });

  if (response.error) {
    logger.error('BgServiceApiCheck.acceptChannelInvitation returned an error',
      { response, error: response.error });
    check.setOffline(`#11-01: acceptChannelInvitation: error: ${response.error}`);
    return null;
  }

  const channelInvitation = response.object;

  if (!channelInvitation) {
    logger.error('BgServiceApiCheck.acceptChannelInvitation: channelInvitation is not defined',
      { response });
    check.setOffline('#11-02: acceptChannelInvitation: error');
    return null;
  }

  if (channelInvitation.id !== channelInvitationId) {
    check.setOffline('#11-03: channelInvitation.id incorrect');
    return null;
  }

  return channelInvitation;
};
