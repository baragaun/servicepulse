import { HttpRequestConfig, ServiceConfig } from '@/definitions';
import fetchJson from '@/services/helpers/fetchJson';

const status = async (serviceConfig: ServiceConfig, request: HttpRequestConfig): Promise<any> => {
  if (!serviceConfig) {
    console.error('graphql.status: no config');
    return;
  }

  const { data } = await fetchJson(request);

  return {
    service: serviceConfig.name,
    url: request.url,
    status: data,
  };
};

export default status;
