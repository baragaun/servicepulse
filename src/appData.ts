import type { ServicePulse } from "@/servicePulse/ServicePulse";

let _servicePulse: ServicePulse | undefined;

const appData = {
  setServicePulse: (servicePulse: ServicePulse): void => {
    _servicePulse = servicePulse;
  },
  getServicePulse: (): ServicePulse | undefined => _servicePulse,
};

export default appData;
