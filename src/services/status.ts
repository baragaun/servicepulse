import { Service } from '@/definitions';

const status = async (services: Service[]): Promise<any> => {
  if (!Array.isArray(services) || services.length < 1) {
    return;
  }
  const promises = services
    .filter((service) => service.enabled())
    .map((service) => service.status());

  const statuses = await Promise.all(promises);

  return statuses;
};

export default status;
