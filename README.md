# Servicepulse

Servicepulse monitors the health of services.

## Configuration

Here is a sample configuration:

```json
{
  "name": "mmdata",
  "type": "bgdata",
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
  "isBgService": true,
  "alertIntervalInMinutes": 60,
  "alertRecipients": ["<admin-email>"]
}
```
