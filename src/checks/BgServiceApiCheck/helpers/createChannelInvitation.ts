import {
  BgNodeClient,
  ChannelInvitation,
} from '@baragaun/bg-node-client';

import appLogger from '../../../helpers/logger.js';
import { BgServiceApiCheck } from '../BgServiceApiCheck.js';
import { verifyChannelInvitationProps } from './verifyChannelInvitationProps.js';

const logger = appLogger.child({ scope: 'BgServiceApiCheck' });

export const createChannelInvitation = async (
  props: Partial<ChannelInvitation>,
  bgNodeClient: BgNodeClient,
  check: BgServiceApiCheck,
): Promise<ChannelInvitation | null> => {
  logger.debug('BgServiceApiCheck.createChannelInvitation: calling API/createChannelInvitation',
    { props });

  const response = await bgNodeClient.operations.channelInvitation.createChannelInvitation(
    props,
  );

  logger.debug('BgServiceApiCheck.createChannelInvitation: received createChannelInvitation response',
    { response });

  if (response.error) {
    logger.error('BgServiceApiCheck.createChannelInvitation returned an error',
      { response, error: response.error });
    check.setOffline(`#08-01: createChannelInvitation: error: ${response.error}`);
    return null;
  }

  const channelInvitation = response.object;

  if (!channelInvitation) {
    logger.error('BgServiceApiCheck.createChannelInvitation: channelInvitation is not defined',
      { response });
    check.setOffline('#08-02: createChannelInvitation: error');
    return null;
  }

  if (channelInvitation.createdBy !== props.createdBy) {
    check.setOffline('#08-03: channelInvitation.createdBy incorrect');
    return null;
  }

  if (channelInvitation.recipientId !== props.recipientId) {
    check.setOffline('#08-04: channelInvitation.recipientId incorrect');
    return null;
  }

  if (channelInvitation.messageText !== props.messageText) {
    check.setOffline('#08-05: channelInvitation.messageText incorrect');
    return null;
  }

  const { errors } = verifyChannelInvitationProps(channelInvitation, props);

  if (errors && errors.length > 0) {
    check.setOffline(`#08-06: createChannelInvitation: ${errors.join(', ')}`);
    return null;
  }

  return channelInvitation;
};
