# Servicepulse

Servicepulse monitors the health of services.

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
    "intervalInMinutes": 5,
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
  repeatedly sent out while the service is in an alert state.
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
