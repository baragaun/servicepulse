import sesClientModule, { SES } from '@aws-sdk/client-ses';
import nodemailer from 'nodemailer';

import appLogger from './logger.js';
import { ServiceConfig } from '../types/index.js';

const logger = appLogger.child({ scope: 'AlertNotifier' });

export class AlertNotifier {
  protected static transporter: nodemailer.Transporter | undefined;

  public sendAlert = async (
    subject: string,
    text: string,
    config: ServiceConfig,
  ) => {
    if (!AlertNotifier.transporter) {
      AlertNotifier.init();

      if (!AlertNotifier.transporter) {
        logger.error('sendAlert: Email not available.');
        return;
      }
    }

    const mailOptions: any = {
      from: process.env.AWS_SES_SENDER_EMAIL,
      subject: subject || 'Servicepulse Alert',
      text: text || 'Please check the status of your services.',
    };

    try {
      for (const recipient of config.alertRecipients) {
        mailOptions.to = recipient;
        const info = await AlertNotifier.transporter.sendMail(mailOptions);
        logger.info('Message sent', { messageId: info.messageId });
      }
    } catch (error) {
      logger.error('Error sending email:', { error });
    }
  }

  protected static init(): void {
    if (AlertNotifier.transporter) {
      return;
    }

    const awsSesAccessKeyId = process.env.AWS_SES_ACCESS_KEY_ID ?? '';
    const awsSesSecretAccessKey = process.env.AWS_SES_SECRET_ACCESS_KEY ?? '';
    const awsSesRegion = process.env.AWS_SES_REGION ?? '';
    const awsOptions = {
      apiVersion: '2010-12-01',
      region: awsSesRegion,
      credentials: {
        accessKeyId: awsSesAccessKeyId,
        secretAccessKey: awsSesSecretAccessKey,
      },
    }

    AlertNotifier.transporter = nodemailer.createTransport({
      SES: {
        ses: new SES(awsOptions),
        aws: sesClientModule,
      },
    })

    logger.info('Email transporter initialized successfully.');
  }
}
