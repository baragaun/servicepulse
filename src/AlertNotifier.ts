import sesClientModule from '@aws-sdk/client-ses';
import nodemailer from 'nodemailer';

import { logger } from './helpers/logger.ts'
import { ServiceConfig } from './types/index.ts'

export class AlertNotifier {
  protected _transporter: nodemailer.Transporter | undefined;
  protected _recipients: string[] = [];

  public constructor() {
    const awsSesAccessKeyId = process.env.AWS_SES_ACCESS_KEY_ID ?? '';
    const awsSesSecretAccessKey = process.env.AWS_SES_SECRET_ACCESS_KEY ?? '';
    const awsSesRegion = process.env.AWS_SES_REGION ?? '';
    this._recipients = (process.env.EMAIL_RECIPIENTS || '').split('|');

    const awsOptions = {
      apiVersion: '2010-12-01',
      region: awsSesRegion,
      credentials: {
        accessKeyId: awsSesAccessKeyId,
        secretAccessKey: awsSesSecretAccessKey,
      },
    }

    this._transporter = nodemailer.createTransport({
      SES: {
        ses: new sesClientModule.SES(awsOptions),
        aws: sesClientModule,
      },
    })
  }

  public sendAlert = async (
    subject: string,
    text: string,
    _config: ServiceConfig,
  ) => {
    if (!this._transporter) {
      logger.error('Email not available.');
      return;
    }

    const mailOptions: any = {
      from: process.env.AWS_SES_SENDER_EMAIL,
      subject: subject || 'Servicepulse Alert',
      text: text || 'Please check the status of your services.',
    };

    try {
      for (const recipient of this._recipients) {
        mailOptions.to = recipient;
        const info = await this._transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}
