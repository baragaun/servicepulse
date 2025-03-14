import nodemailer from 'nodemailer';

import appStore from '../appStore.js';
import loadServices from '../services/helpers/loadServices.js';

jest.mock('nodemailer');

describe('alertNotifier', () => {
  beforeAll(async () => {
    await loadServices();
  });

  it('should send an email', async () => {
    const mock = true;
    let sendMailMock;

    if (mock) {
      sendMailMock = jest.fn().mockResolvedValue({ messageId: '12345' });
      (nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail: sendMailMock });
    }

    const service = appStore.service('mmdata');

    expect(service).toBeDefined();

    service!.sendAlert();

    if (mock) {
      expect(sendMailMock).toHaveBeenCalled();
      expect(sendMailMock).toHaveBeenCalledWith({
        from: '"Servicepulse" <holger@baragaun.com>',
        to: 'holger@baragaun.com',
        subject: `Service alert for ${service!.name}`,
        text: 'Hello world?',
      });
    }
  });
});
