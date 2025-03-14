// src/test/mailer.spec.ts
import nodemailer from 'nodemailer';

import mailer from '../helpers/mailer.ts';

jest.mock('nodemailer');

describe('Mailer', () => {
  beforeAll(() => {
    mailer.init();
  });

  it('should send an email', async () => {
    const mock = true;
    let sendMailMock;

    if (mock) {
      sendMailMock = jest.fn().mockResolvedValue({ messageId: '12345' });
      (nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail: sendMailMock });
    }

    await mailer.send();

    if (mock) {
      expect(sendMailMock).toHaveBeenCalled();
      expect(sendMailMock).toHaveBeenCalledWith({
        from: '"Servicepulse" <holger@baragaun.com>',
        to: 'holger@baragaun.com',
        subject: 'Servicepulse Alert',
        text: 'Hello world?',
      });
    }
  });
});
