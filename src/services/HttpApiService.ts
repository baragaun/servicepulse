// import { GraphQLClient } from 'graphql-request';

import { ServiceType } from "@/enums";
import type { HttpApiServiceConfig } from "@/types";

import { GenericService } from "./GenericService";

export class HttpApiService extends GenericService {
  public type = ServiceType.graphql;
  public readonly config: HttpApiServiceConfig;
  // private graphqlClient: GraphQLClient | undefined;

  public constructor(serviceConfig: HttpApiServiceConfig) {
    super(serviceConfig);
    this.config = serviceConfig;
    this.init();
  }

  public init(): void {
    // this.graphqlClient = new GraphQLClient((this.config as HttpApiServiceConfig).endpoint);
  }
}
