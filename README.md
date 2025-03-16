# Servicepulse

Servicepulse monitors the health of services. It is primarily meant for backends that use
secureid-service and/or channels-service, but can be used to monitor any other HTTP service.

# Setup

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

Create a `.env` file in the root directory. Use the sample `.env.example` file as a reference.

To configure the services that Servicepulse will monitor, create one or more JSON files in
the `config` directory, one each for a service you want to monitor.

Here is a sample configuration:

```json
{
  "name": "mmdata",
  "type": "bg-service",
  "enabled": true,
  "jobs": [
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
* **jobs**: An array of job configurations for the service.
  * **type**: The type of the job of type `JobType`.
  * **url**: The URL to be monitored or checked by the job.
  * **schedule**: The schedule for the job in cron format or predefined intervals (e.g., 
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
export class MyTest extends BaseJob {
  public constructor(config: BaseJobConfig, service: BaseService) {
    super(config, service);
  }

  public async run(): Promise<boolean> {
    let json: any | undefined = undefined;

    this._health = ServiceHealth.unknown;
    this._reason = '';
    this._running = true;

    try {
      logger.debug('MyTest.run: loading service status.', { config: this._config });
      json = await fetchJsonData(this._config.url);
    } catch (error) {
      logger.error('MyTest.run: error in fetching.', { error });
      this._health = ServiceHealth.unreachable;
      this._running = false;
      this._service.onJobFinished();
      return false;
    }

    logger.debug('MyTest.run: fetched JSON data:', { json });

    if (!json) {
      logger.error('MyTest.run: no JSON data found.');
      this._health = ServiceHealth.failedToParse;
      this._reason = 'No JSON data found';
      this._running = false;
      this._service.onJobFinished();

      return false;
    }

    if (json.status) {
      logger.debug('MyTest.run: found status.',
              { status: json.status });
      (this._service as BgDataService).serviceStatusReport = json;
      this._health = json.status;
    }

    this._running = false;
    this._service.onJobFinished();

    return true;
  }

  public get name(): string {
    return 'my-test';
  }
}

```
