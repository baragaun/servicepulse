import { GraphQLClient } from 'graphql-request';

import { HttpApiServiceConfig } from '@/definitions';
import { ServiceType } from '@/enums';
import { GenericService } from './GenericService';

export class HttpApiService extends GenericService {
  public type = ServiceType.graphql;
  protected readonly config: HttpApiServiceConfig;
  private graphqlClient: GraphQLClient | undefined;

  public constructor(serviceConfig: HttpApiServiceConfig) {
    super(serviceConfig);
    this.config = serviceConfig;
    this.init();
  }

  public init(): void {
    this.graphqlClient = new GraphQLClient((this.config as HttpApiServiceConfig).endpoint);
  }
}
