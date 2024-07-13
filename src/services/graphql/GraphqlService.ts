import { GraphQLClient } from 'graphql-request';

import { GraphqlServiceConfig } from '@/definitions';
import { ServiceType } from '@/enums';
import { GenericService } from '@/services/generic/GenericService';

export class GraphqlService extends GenericService {
  public type = ServiceType.graphql;
  protected readonly config: GraphqlServiceConfig;
  private graphqlClient: GraphQLClient | undefined;

  public constructor(serviceConfig: GraphqlServiceConfig) {
    super(serviceConfig);
    this.config = serviceConfig;
    this.init();
  }

  public init(): void {
    this.graphqlClient = new GraphQLClient((this.config as GraphqlServiceConfig).endpoint);
  }
}
