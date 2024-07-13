import { Express, Request, Response } from 'express';

import appData from '@/appData';

const initVerifyStatusRoute = (app: Express, path: string) => {
  app.get(path, (_req: Request, res: Response) => {
    const services = appData.getServices();

    if (!services) {
      // res.setHeader('Content-Type', 'application/json');
      res.end('error');
      return;
    }

    services.verifyStatus().then((status) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(status));
    });
  });
};

export default initVerifyStatusRoute;
