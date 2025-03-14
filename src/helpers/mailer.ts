import sesClientModule from '@aws-sdk/client-ses';
import nodemailer from 'nodemailer';

import { logger } from './logger.ts'

let _transporter: nodemailer.Transporter | undefined;
let _recipients: string[] = [];

const init = (): void => {
  const awsSesAccessKeyId = process.env.AWS_SES_ACCESS_KEY_ID ?? '';
  const awsSesSecretAccessKey = process.env.AWS_SES_SECRET_ACCESS_KEY ?? '';
  const awsSesRegion = process.env.AWS_SES_REGION ?? '';
  _recipients = (process.env.EMAIL_RECIPIENTS || '').split('|');

  const awsOptions = {
    apiVersion: '2010-12-01',
    region: awsSesRegion,
    credentials: {
      accessKeyId: awsSesAccessKeyId,
      secretAccessKey: awsSesSecretAccessKey,
    },
  }

  _transporter = nodemailer.createTransport({
    SES: {
      ses: new sesClientModule.SES(awsOptions),
      aws: sesClientModule,
    },
  })
}

// Create a transporter object using the default SMTP transport

// Send the email
const send = async () => {
  if (!_transporter) {
    logger.error('Email not available.');
    return;
  }

// Define the email options
  const mailOptions: any = {
    from: process.env.AWS_SES_SENDER_EMAIL,
    subject: 'Servicepulse Alert',
    text: 'Hello world?',
  };

  try {
    for (const recipient of _recipients) {
      mailOptions.to = recipient;
      const info = await _transporter.sendMail(mailOptions);
      console.log('Message sent: %s', info.messageId);
    }
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

const mailer = {
  init,
  send,
};

export default mailer;
