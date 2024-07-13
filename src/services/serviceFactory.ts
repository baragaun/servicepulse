import { Service, ServiceConfig } from '@/definitions';
import { ServiceType } from '@/enums';
import { GraphqlService } from '@/services/graphql/GraphqlService';

const serviceFactory = (serviceConfig: ServiceConfig): Service => {
  switch (serviceConfig.type) {
    case ServiceType.graphql:
      return new GraphqlService(serviceConfig);
  }
};

export default serviceFactory;
