import jsonpath from 'jsonpath';

import {
  E2eTestSequence,
  E2eTestSuite,
  HttpRequestConfig,
  JsonHttpRequestE2eTest,
  TestResult
} from '@/definitions'
import fetchJson from '@/services/helpers/fetchJson';
import mergeVars from '@/services/helpers/mergeVars';
import replaceVars from '@/services/helpers/replaceVars';
import replaceVarsInObject from '@/services/helpers/replaceVarsInObject';
import validateValue from '@/services/helpers/validateValue';

const runJsonHttpRequest = async (
  test: JsonHttpRequestE2eTest,
  sequence: E2eTestSequence,
  suite: E2eTestSuite,
  results: TestResult[],
): Promise<TestResult[]> => {
  const testName = `${sequence.name}.${test.name}`;
  let vars = mergeVars(suite.vars, sequence.vars);
  vars = mergeVars(vars, test.vars);

  let headers = mergeVars(suite.headers, sequence.headers);
  headers = replaceVarsInObject(mergeVars(headers, test.headers), vars);

  const requestConfig: HttpRequestConfig = {
    url: replaceVars(test.endpoint || sequence.endpoint || suite.endpoint || '', vars),
    method: sequence.method || test.method,
    headers,
    data: test.data ? replaceVars(test.data, vars) : '',
  };

  const { response, data, error } = await fetchJson(requestConfig);

  if (error) {
    results.push({ name: testName, passed: false, error: `error-in-response: ${error}; data: ${data || ''}` });
    return results;
  }

  if (!response) {
    results.push({ name: testName, passed: false, error: `error-response: empty` });
    return results;
  }

  if (!data) {
    results.push({ name: testName, passed: false, error: 'no-data-in-response' });
    return results;
  }

  if (Array.isArray(data.errors) && data.errors.length > 0) {
    results.push({ name: testName, passed: false, error: `error-response: ${data.errors.join(', ')}` });
    return results;
  }

  if (Array.isArray(test.response?.readVars) && test.response?.readVars.length > 0) {
    test.response?.readVars.forEach((readVar) => {
      let value: string | undefined = undefined;
      try {
        const values = jsonpath.query(data, readVar.jsonPath);
        if (Array.isArray(values) && values.length === 1) {
          value = values[0];
        }
      } catch (error) {
        console.error(error);
        // checkResult.passed = false;
        // checkResult.error = 'jsonpath-failed';
      }
      if (value) {
        if (readVar.scope === 'suite') {
          if (suite.vars) {
            suite.vars[readVar.name] = value;
          } else {
            suite.vars = { [readVar.name]: value };
          }
        } else if (readVar.scope === 'sequence') {
          if (sequence.vars) {
            sequence.vars[readVar.name] = value;
          } else {
            sequence.vars = { [readVar.name]: value };
          }
        }
      }
    });
  }

  if (Array.isArray(test.response?.checks) && test.response?.checks.length > 0) {
    test.response?.checks
      .filter((check) => check.enabled === undefined || check.enabled)
      .forEach((check) => {
        let value: string | undefined = undefined;
        try {
          const values = jsonpath.query(data, check.jsonPath);
          if (Array.isArray(values) && values.length === 1) {
            value = values[0];
          }
          let targetValue: string | undefined;
          if (check.targetVar && vars) {
            targetValue = vars[check.targetVar];
          }
          results.push(validateValue(`${testName}.${check.name}`, value, check, targetValue));
        } catch (error) {
          console.error(error);
        }
      });
  }

  return results;
};

export default runJsonHttpRequest;
