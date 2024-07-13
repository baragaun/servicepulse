import { HttpRequestConfig, ServiceConfig } from '@/definitions';
import fetchJson from '@/services/helpers/fetchJson';

const status = async (serviceConfig: ServiceConfig, request: HttpRequestConfig): Promise<any> => {
  if (!serviceConfig) {
    console.error('graphql.status: no config');
    return;
  }

  const status = await fetchJson(request);
  console.log('graphql status=', status);

  return {
    service: serviceConfig.name,
    url: request.url,
    status,
  };
};

export default status;
