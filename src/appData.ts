import type { ServiceList } from "@/services/ServiceList";

let serviceList: ServiceList | undefined;

const appData = {
  setServiceList: (list: ServiceList) => {
    serviceList = list;
  },
  getServices: () => serviceList,
};

export default appData;
