import { ServiceType } from "@/enums";
import { GenericService } from "@/services/GenericService";
import { HttpApiService } from "@/services/HttpApiService";
import { SecureIdService } from "@/services/SecureIdService";
import type { Service, ServiceConfig } from "@/types";

const serviceFactory = (serviceConfig: ServiceConfig): Service => {
  switch (serviceConfig.type) {
    case ServiceType.generic:
      return new GenericService(serviceConfig);
    case ServiceType.graphql:
      return new HttpApiService(serviceConfig);
    case ServiceType.secureId:
      return new SecureIdService(serviceConfig);
  }
};

export default serviceFactory;
