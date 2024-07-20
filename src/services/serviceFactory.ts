import { Service, ServiceConfig } from '@/definitions';
import { ServiceType } from '@/enums';
import { GenericService } from '@/services/GenericService';
import { HttpApiService } from '@/services/HttpApiService';

const serviceFactory = (serviceConfig: ServiceConfig): Service => {
  switch (serviceConfig.type) {
    case ServiceType.generic:
      return new GenericService(serviceConfig);
    case ServiceType.graphql:
      return new HttpApiService(serviceConfig);
  }
};

export default serviceFactory;
