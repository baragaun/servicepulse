import { Service, VerifyStatusResult } from '@/definitions';

const verifyStatus = async (services: Service[]): Promise<VerifyStatusResult[]> => {
  if (!Array.isArray(services) || services.length < 1) {
    return;
  }
  const promises = services
    .filter((service) => service.enabled())
    .map((service) => service.verifyStatuses());

  return (await Promise.all(promises)).flat();
};

export default verifyStatus;
