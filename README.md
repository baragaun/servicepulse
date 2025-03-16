# Servicepulse

Servicepulse monitors the health of services. It is primarily meant for backends that use
[secureid-service](https://github.com/baragaun/secureid-service) and/or
[channels-service](https://github.com/baragaun/channels-service), but can be used to 
monitor any other HTTP service.
It uses [bg-node-client](https://github.com/baragaun/bg-node-client) to run through some 
end-to-end tests to verify the operational status of the GraphQL API.

## Setup

Clone this repository and install the dependencies:

```bash
git clone git@github.com:baragaun/servicepulse.git

cd servicepulse

# Use nvm to activate the correct Node.js version:
nvm use

pnpm install
pnpm build
```

## Configuration

Create a `.env` file in the root directory. Use the sample `.env.example` file as a reference:

```bash
PORT=8093

# Logging:
LOG_FILE="servicepulse.log"
LOG_DIR="logs"
LOG_LEVEL=debug

# AWS SES for sending out emails:
AWS_SES_ACCESS_KEY_ID=<key>
AWS_SES_SECRET_ACCESS_KEY=<secret-key>
AWS_SES_REGION=<region>
AWS_SES_SENDER_EMAIL=<email>
```

To configure the services that Servicepulse will monitor, create one or more JSON files in
the `config` directory, one each for a service you want to monitor.

Here is a sample configuration:

```json
{
  "name": "mmdata",
  "type": "bg-service",
  "enabled": true,
  "checks": [
    {
      "type": "bg-service-status",
      "url": "<status-url>",
      "schedule": "everyMinute"
    },
    {
      "type": "bg-service-api",
      "url": "<api-url>",
      "schedule": "every30Minutes"
    }
  ],
  "alerts": [{
    "intervalInMinutes": 30,
    "recipients": [
      { "name": "<name>", "email": "<email>" }
    ]
  }]
}
```

* **name**: The name of the service.
* **type**: The type of the service of type `ServiceType`
* **enabled**: A boolean indicating whether the service is enabled.
* **checks**: An array of check configurations for the service.
  * **type**: The type of the check of type `CheckType`.
  * **url**: The URL to be monitored or checked by the check.
  * **schedule**: The schedule for the check in cron format or predefined intervals (e.g., 
    `everyMinute`, `every30Minutes`).
* **alertIntervalInMinutes**: The interval in minutes between alert notifications that are 
  repeatedly sent out while the service is in an alert state. Default is 60 minutes.
* **alertRecipients**: An array of email addresses to receive alert notifications.

## Running Servicepulse

Start Servicepulse with:

```bash
pnpm start
# Or:
node --env-file=.env dist/index.js
```

Consider using PM2 for production deployment:

```bash
pnpm install -g pm2
pm2 start node --env-file=.env dist/index.js --name servicepulse
```

## Writing More Tests

Here is a simple test that would monitor a service that returns a JSON response:

```ts
export class MyTest extends BaseCheck {
  public constructor(config: BaseCheckConfig, service: BaseService) {
    super(config, service);
  }

  public async run(): Promise<boolean> {
    let json: any | undefined = undefined;

    this._health = ServiceHealth.unknown;
    this._reason = '';
    this._running = true;

    try {
      json = await fetchJsonData(this._config.url);
    } catch (error) {
      this._health = ServiceHealth.unreachable;
      this._running = false;
      this._service.onCheckFinished();
      return false;
    }

    if (!json) {
      this._health = ServiceHealth.failedToParse;
      this._running = false;
      this._service.onCheckFinished();

      return false;
    }

    // todo: read JSON and determine whether the service is healthy or not
    this._health = ServiceHealth.ok;
    
    this._running = false;
    this._service.onCheckFinished();

    return true;
  }

  public get name(): string {
    return 'my-test';
  }
}
```

Then add it to your configuration file:

```json
{
  "type": "my-test",
  "url": "<url>",
  "schedule": "everyMinute"
}
```
