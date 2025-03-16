import { ServiceHealth } from '../enums.js';

const priorities: ServiceHealth[] = [
  ServiceHealth.unknown,
  ServiceHealth.ok,
  ServiceHealth.limited,
  ServiceHealth.failedToParse,
  ServiceHealth.offline,
  ServiceHealth.unreachable,
]

const chooseMoreRelevantHealth = (health1: ServiceHealth, health2: ServiceHealth) => {
  if (health1 && !health2) {
    return health1;
  }

  if (health2 && !health1) {
    return health2;
  }

  if (health1 === health2) {
    return health1;
  }

  return priorities.indexOf(health1) > priorities.indexOf(health2)
    ? health1
    : health2;
}

export default chooseMoreRelevantHealth;
