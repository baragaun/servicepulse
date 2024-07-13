import express, { Request, Response, Router } from 'express';

import appData from '@/appData';

export const statusRouter: Router = (() => {
  const router = express.Router();

  router.get('/', (_req: Request, res: Response) => {
    const services = appData.getServices();

    if (!services) {
      // res.setHeader('Content-Type', 'application/json');
      res.end('error');
      return;
    }

    services.status().then((status) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(status));
    });
  });

  return router;
})();
