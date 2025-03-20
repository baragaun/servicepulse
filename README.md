# Servicepulse

Servicepulse monitors the health of services. It is primarily meant for backends that use
[secureid-service](https://github.com/baragaun/secureid-service) and/or
[channels-service](https://github.com/baragaun/channels-service), but can be used to 
monitor any other HTTP service.
It uses [bg-node-client](https://github.com/baragaun/bg-node-client) to run through some 
end-to-end tests to verify the operational status of the GraphQL API.

## Pre-requisites
* Node.js v20 or higher
* AWS account with SES access to send out emails

## Setup

Clone this repository and install the dependencies:

```bash
git clone git@github.com:baragaun/servicepulse.git

cd servicepulse

# Use nvm to activate the correct Node.js version:
nvm use

npm install
npm build
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
  
## Alerts

You can set up one or more alerts for each service. An alert can have one or more recipient
email addresses. If the service goes into an alert state, alerts will be sent out in the 
configured interval until the service is back to a healthy state.

With this, you can set up an alert to be sent to your mobile phone as a text message (check
your mobile provider for details on how to set up an email-to-SMS gateway), plus receive
alert emails, both on their own schedule.

## Running Servicepulse

Start Servicepulse with:

```bash
npm run start
# Or:
node dist/index.js
```

## Setting Up A New Remote Host

### Set Up Folder Structure And Upload Files

```shell
REMOTE_HOST=<remote-host>

# SSH into the remote host:
ssh ${REMOTE_HOST}

mkdir -p apps/servicepulse/logs
mkdir -p apps/servicepulse/config
mkdir -p apps/servicepulse/env

# Back to your local machine:
exit

rsync -avPe ssh --delete \
--exclude "*.md" \
--exclude "test/*" \
--exclude "*/docs/*" \
src \
package.json \
tsconfig.json \
${REMOTE_HOST}:apps/servicepulse/

scp env/.env.production ${REMOTE_HOST}:apps/servicepulse/.env
scp -r config ${REMOTE_HOST}:apps/servicepulse/

# SSH into the remote host:
ssh ${REMOTE_HOST}
cd apps/servicepulse
npm install
npm build

# If you want to use PM2:
sudo npm install -g pm2

# Make pm2 auto-boot at server restart:
pm2 startup

# Start Servicepulse:
pm2 start dist/index.js --name servicepulse

# To tail the logs:
tail -f logs/servicepulse<-date>.log
```

### Setting Up Servicepulse On Host Without Docker

```shell
# SSH into the remote host:
ssh ${REMOTE_HOST}
cd apps/servicepulse
npm install

# If you want to use PM2:
sudo npm install -g pm2
pm2 start dist/index.js --name servicepulse

# To tail the logs:
tail -f logs/servicepulse<-date>.log
```

### Using Docker

```shell
# SSH into the remote host:
ssh ${REMOTE_HOST}

# Install Docker on Ubuntu 24.04 LTS
# see: https://linuxiac.com/how-to-install-docker-on-ubuntu-24-04-lts/
sudo apt update
sudo apt upgrade -y
sudo apt install -y apt-transport-https curl
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl is-active docker

# Allowing user to run Docker commands without sudo:
sudo usermod -aG docker ${USER}

# Log out and in again to apply the group changes
exit

# Build Docker container and run it:
ssh ${REMOTE_HOST}
cd apps/servicepulse
docker compose up -d
```

## Deploying Servicepulse (Without Docker)

You can use the [bin/deploy.sh](bin/deploy.sh) script to deploy a new version of
Servicepulse to a remote host. You'll have to adjust the `REMOTE_HOST` variable 
in the script.

## Writing More Service Checks

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
