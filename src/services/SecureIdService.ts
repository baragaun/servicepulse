import { ServiceType } from "@/enums";
import type { SecureIdServiceConfig } from "@/types";

import { GenericService } from "./GenericService";

export class SecureIdService extends GenericService {
  public type = ServiceType.secureId;
  public readonly config: SecureIdServiceConfig;

  public constructor(serviceConfig: SecureIdServiceConfig) {
    super(serviceConfig);
    this.config = serviceConfig;
    this.init();
  }

  public init(): void {}
}
