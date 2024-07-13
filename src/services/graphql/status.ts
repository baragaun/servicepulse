import { ServiceConfig } from '@/definitions';
import fetchJson from '@/services/helpers/fetchJson';

const status = async (serviceConfig: ServiceConfig): Promise<any> => {
  if (!serviceConfig) {
    console.error('graphql.status: no config');
    return;
  }

  const status = await fetchJson(serviceConfig.status.request);
  console.log('graphql status=', status);

  return {
    service: serviceConfig.name,
    status,
  };
};

export default status;
