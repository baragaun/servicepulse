import { GraphQLClient } from 'graphql-request';

import { GraphqlServiceConfig, Service, ServiceConfig } from '@/definitions'
import { ServiceType } from '@/enums';
import statusImpl from '@/services/graphql/status';

export class GraphqlService implements Service {
  public type = ServiceType.graphql;
  private readonly config: ServiceConfig;
  private graphqlClient: GraphQLClient | undefined;

  public constructor(serviceConfig: GraphqlServiceConfig) {
    this.config = serviceConfig;
    this.init();
  }

  public init() {
    this.graphqlClient = new GraphQLClient(this.config.endpoint);
  }

  public enabled() {
    return this.config.enabled;
  }

  public status() {
    return statusImpl(this.config);
  }
}
