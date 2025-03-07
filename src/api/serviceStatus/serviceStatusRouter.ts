import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Request, type Response, type Router } from "express";
import { z } from "zod";

import { check, getStatus } from '../../services/mmdata';
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { handleServiceResponse } from "@/common/utils/httpHandlers";

export const serviceStatusRegistry = new OpenAPIRegistry();
export const serviceStatusRouter: Router = express.Router();

serviceStatusRegistry.registerPath({
  method: "get",
  path: "/service-status",
  tags: ["Service Status"],
  responses: createApiResponse(z.null(), "Success"),
});

serviceStatusRouter.get("/", (_req: Request, res: Response) => {
  check();
  const result = getStatus();
  const serviceResponse = ServiceResponse.success("Service-status", <string>result);
  return handleServiceResponse(serviceResponse, res);
});
