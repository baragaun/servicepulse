import { E2eTestSuiteResult, Service } from '@/definitions';

const runE2eTests = async (services: Service[]): Promise<E2eTestSuiteResult[]> => {
  if (!Array.isArray(services) || services.length < 1) {
    return;
  }
  const promises = services
    .filter((service) => service.enabled() && service.config?.e2eTests)
    .map((service) => service.runE2ETests());

  const result: (E2eTestSuiteResult | undefined)[] = (await Promise.all(promises)).flat();

  return result.filter((r) => r) as E2eTestSuiteResult[];
};

export default runE2eTests;
