import jsonpath from 'jsonpath';

import {
  ServiceStatusCheck,
  ServiceStatusRequestConfig,
  StatusCheckResult,
  VerifyStatusResult,
} from '@/definitions';
import { ServiceStatus } from '@/enums';

// [
//   {
//     "service": "mmdata",
//     "status": {
//       "status": "offline",
//       "services": [
//         {
//           "serviceName": "firebase",
//           "status": "ok",
//           "stats": {
//             "pushNotificationsSinceLastStart": 0,
//             "pushNotificationsFailedToSendSinceLastStart": 0,
//             "updatedAt": ""
//           }
//         },
//         {
//           "serviceName": "graphql-api",
//           "status": "ok",
//           "stats": {
//             "requestsPerSecond": 0,
//             "averageRequestProcessingTime": 0,
//             "updatedAt": "2024-07-13T05:11:27.792Z"
//           }
//         },
//         {
//           "serviceName": "messaging",
//           "status": "offline",
//           "enableEmail": true,
//           "enableInAppMessages": true,
//           "enablePushNotifications": true,
//           "enableSms": false,
//           "emailServiceStatus": "offline",
//           "pushNotificationServiceStatus": "offline",
//           "smsServiceStatus": "offline",
//           "stats": {
//             "averageEmailsPerHour": 0,
//             "emailsSentPastHour": 0,
//             "emailsSentSinceLastStart": 0,
//             "emailsFailedToSendSinceLastStart": 0,
//             "averageInAppMessagesSentPerHour": 0,
//             "inAppMessagesSentPastHour": 0,
//             "inAppMessagesSentSinceLastStart": 0,
//             "inAppMessagesFailedToSendSinceLastStart": 0,
//             "averagePushNotificationsPerHour": 0,
//             "pushNotificationsPastHour": 0,
//             "pushNotificationsSinceLastStart": 0,
//             "pushNotificationsFailedToSendSinceLastStart": 0,
//             "averageSmsPerHour": 0,
//             "smsSentPastHour": 0,
//             "smsSentSinceLastStart": 0,
//             "smsFailedToSendSinceLastStart": 0,
//             "updatedAt": "2024-07-13T05:26:44.608Z"
//           }
//         },
//         {
//           "serviceName": "redis",
//           "status": "ok",
//           "stats": {
//             "keysInAppEventsPub": "24542",
//             "keysInAppEventsSub": 0,
//             "keysInMessageBus": "1084040",
//             "keysInSessionStore": "96",
//             "keysInTempData": 0,
//             "connectedClients": "52",
//             "clusterConnections": "0",
//             "clusterEnabled": "0",
//             "usedMemory": "1465877584",
//             "upTimeInDays": "17",
//             "role": "master",
//             "totalConnectionsReceived": "5738",
//             "pubsubChannels": "30",
//             "errorstatERR": "",
//             "updatedAt": "2024-07-13T05:21:44.515Z"
//           }
//         },
//         {
//           "serviceName": "secure-id",
//           "status": "ok",
//           "stats": {
//             "activeUsersPastHour": 0,
//             "usersSignedUpPast24Hours": 0,
//             "updatedAt": "2024-07-13T05:21:47.354Z"
//           }
//         },
//         {
//           "serviceName": "db",
//           "status": "ok",
//           "stats": {
//             "db": "test",
//             "collections": 0,
//             "views": 0,
//             "objects": 0,
//             "avgObjSize": 0,
//             "dataSize": 0,
//             "storageSize": 0,
//             "indexes": 0,
//             "indexSize": 0,
//             "totalSize": 0,
//             "scaleFactor": 1,
//             "fsUsedSize": 0,
//             "fsTotalSize": 0,
//             "ok": 1,
//             "status": "ok",
//             "updatedAt": "2024-07-13T05:21:28.330Z"
//           }
//         }
//       ],
//       "uptime": 937,
//       "uptimeHuman": "16 minutes"
//     }
//   }
// ]

const verifyBooleanCheck = (stringValue: string, config: ServiceStatusCheck) => {
  if (config.dataType !== 'boolean') {
    return false;
  }
  const booleanValue = ['1', 'true', 'yes'].includes(stringValue.toLowerCase());

  if (config.targetBooleanValue !== true && config.targetBooleanValue !== false) {
    console.log('verifyBooleanCheck: missing targetBooleanValue');
    return false;
  }

  return booleanValue === config.targetBooleanValue;
};

const verifyDateCheck = (stringValue: string, config: ServiceStatusCheck) => {
  if (config.dataType !== 'date') {
    return false;
  }
  const booleanValue = ['1', 'true', 'yes'].includes(stringValue.toLowerCase());

  if (config.targetBooleanValue !== true && config.targetBooleanValue !== false) {
    console.log('verifyBooleanCheck: missing targetBooleanValue');
    return false;
  }

  return booleanValue === config.targetBooleanValue;
};

const verifyNumericCheck = (stringValue: string, config: ServiceStatusCheck) => {
  if (config.dataType !== 'number') {
    return false;
  }
  const numericValue = Number.parseInt(stringValue);
  if (!numericValue || isNaN(numericValue)) {
    return false;
  }
  if (config.minNumericValue && numericValue < config.minNumericValue) {
    return false;
  }
  if (config.maxNumericValue && numericValue > config.maxNumericValue) {
    return false;
  }
  if (config.targetIntegerValue && numericValue !== config.targetIntegerValue) {
    return false;
  }
  return true;
};

const verifyStringCheck = (stringValue: string, config: ServiceStatusCheck) => {
  if (config.dataType !== 'string') {
    return false;
  }
  if (config.targetStringValue && stringValue !== config.targetStringValue) {
    return false;
  }
  if (
    config.regexExpression &&
    config.regexFlags &&
    !stringValue.match(new RegExp(config.regexExpression, config.regexFlags))
  ) {
    return false;
  }
  return true;
};

const verifyCheck = (stringValue: string, config: ServiceStatusCheck) => {
  switch (config.dataType) {
    case 'boolean':
      return verifyBooleanCheck(stringValue, config);
    case 'date':
      return verifyDateCheck(stringValue, config);
    case 'number':
      return verifyNumericCheck(stringValue, config);
    case 'string':
      return verifyStringCheck(stringValue, config);
  }
  return false;
};

const verifyStatus = (
  serviceName: string,
  status: any,
  statusConfig: ServiceStatusRequestConfig,
): VerifyStatusResult => {
  try {
    const result: VerifyStatusResult = {
      serviceName,
      url: status.url,
      newStatus: ServiceStatus.ok,
      checks: [],
    };

    if (!status) {
      console.error('verifyStatus: no status given');
      result.newStatus = ServiceStatus.offline;
      return result;
    }
    if (!statusConfig) {
      console.error('verifyStatus: no statusConfig given');
      result.newStatus = ServiceStatus.offline;
      return result;
    }

    for (let i = 0; i < statusConfig.checks.length; i++) {
      const checkResult: StatusCheckResult = {
        name: statusConfig.checks[i].name,
        passed: true,
      };

      let values: string[];
      try {
        values = jsonpath.query(status, statusConfig.checks[i].jsonPath);
      } catch (error) {
        console.error(error);
        checkResult.passed = false;
        checkResult.error = 'jsonpath-failed';
      }

      if (checkResult.passed) {
        if (!Array.isArray(values) || values.length != 1) {
          checkResult.passed = false;
          checkResult.error = 'value-not-found';
        } else if (!verifyCheck(values[0] as any, statusConfig.checks[i])) {
          checkResult.passed = false;
          // checkResult.error = 'value-failed';
        }
      }

      if (!checkResult.passed) {
        if (statusConfig.checks[i].statusIfFail === ServiceStatus.offline) {
          result.newStatus = ServiceStatus.offline;
        } else if (statusConfig.checks[i].statusIfFail === ServiceStatus.limited) {
          if (result.newStatus === ServiceStatus.ok) {
            result.newStatus = ServiceStatus.limited;
          }
        }
      }

      result.checks.push(checkResult);
    }

    return result;
  } catch (error) {
    console.error(error);
  }
};

export default verifyStatus;
