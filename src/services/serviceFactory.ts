import { Service, ServiceConfig } from '@/definitions';
import { ServiceType } from '@/enums';
import { GenericService } from '@/services/generic/GenericService';
import { GraphqlService } from '@/services/graphql/GraphqlService';

const serviceFactory = (serviceConfig: ServiceConfig): Service => {
  switch (serviceConfig.type) {
    case ServiceType.generic:
      return new GenericService(serviceConfig);
    case ServiceType.graphql:
      return new GraphqlService(serviceConfig);
  }
};

export default serviceFactory;
