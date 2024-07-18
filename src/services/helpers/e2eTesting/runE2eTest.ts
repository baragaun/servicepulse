import {
  E2eTest,
  E2eTestSequence,
  E2eTestSuite,
  JsonHttpRequestE2eTest,
  TestResult,
} from '@/definitions'
import { E2eTestType } from '@/enums';
import runJsonHttpRequest from '@/services/helpers/e2eTesting/runJsonHttpRequestTest';

const runE2eTest = async (
  test: E2eTest,
  sequence: E2eTestSequence,
  suite: E2eTestSuite,
  results: TestResult[],
): Promise<TestResult[]> => {
  return new Promise((resolve, reject) => {
    const run = () => {
      switch (test.type) {
        case E2eTestType.jsonHttpRequest:
          runJsonHttpRequest(test as JsonHttpRequestE2eTest, sequence, suite, results)
            .then((results) => {
            if (test.waitMilliSecondsAfter) {
              setTimeout(() => {
                resolve(results);
              }, test.waitMilliSecondsAfter || 2000);
              return;
            }
            resolve(results);
          }, reject);
          return;
        case E2eTestType.wait:
          setTimeout(
            () => {
              resolve(results);
            },
            test.waitMilliSecondsAfter || test.waitMilliSecondsBefore || 2000
          );
          return;
      }
    };

    if (test.waitMilliSecondsBefore) {
      setTimeout(run, test.waitMilliSecondsBefore);
      return;
    }

    run();
    return;

    console.error('runTest: unknown type', test);
    reject('unknown test type');
  });
};

export default runE2eTest;
