import { E2eTestSuite, E2eTestSuiteResult, TestResult } from '@/definitions';
import runE2eTest from '@/services/helpers/e2eTesting/runE2eTest';

const runE2eTestSuite = async (e2eTestSuite: E2eTestSuite): Promise<E2eTestSuiteResult> => {
  let results: TestResult[] = [];

  for (let i = 0; i < e2eTestSuite.sequences.length; i++) {
    const sequence = e2eTestSuite.sequences[i];
    for (let j = 0; j < sequence.tests.length; j++) {
      if (sequence.tests[j].enabled === undefined || sequence.tests[j].enabled) {
        results = await runE2eTest(sequence.tests[j], sequence, e2eTestSuite, results);
      }
    }
  }

  const passed = !results.some((r) => !r.passed);

  return { passed, checks: results };
};

export default runE2eTestSuite;
