import { GraphQLClient } from 'graphql-request';

import { GraphqlServiceConfig, Service, ServiceConfig, VerifyStatusResult } from '@/definitions'
import { ServiceType } from '@/enums';
import statusImpl from '@/services/graphql/status';
import verifyStatusHelper from '@/services/helpers/verifyStatus';

export class GraphqlService implements Service {
  public type = ServiceType.graphql;
  private readonly config: ServiceConfig;
  private graphqlClient: GraphQLClient | undefined;

  public constructor(serviceConfig: GraphqlServiceConfig) {
    this.config = serviceConfig;
    this.init();
  }

  public init(): void {
    this.graphqlClient = new GraphQLClient(this.config.endpoint);
  }

  public name(): string {
    return this.config.name;
  }

  public enabled(): boolean {
    return this.config.enabled;
  }

  public status(): Promise<any> {
    return statusImpl(this.config);
  }

  public async verifyStatus(): Promise<VerifyStatusResult> {
    const status = await this.status();
    return verifyStatusHelper(this.config.name, status, this.config.status);
  }
}
