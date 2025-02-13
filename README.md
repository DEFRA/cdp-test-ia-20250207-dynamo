# cdp-test-ia-20250207-dynamo


Testing a CDP frontend node app using DynamoDB as cache

## Libraries

New dependencies

* `@aws-sdk/client-dynamodb`
* `@aws-sdk/credential-providers`
* `@aws-sdk/lib-dynamodb`,
* `@hapi/hoek`

## Local setup

Added dynamodb to localstack in the compose file `~/compose.yml`

```
SERVICES: s3,sqs,sns,firehose,dynamodb
```

## Config

New configurations added in `config.js`

```
aws: {
   dynamodb: {
      endpoint,
      createTable,
      tableName
   },
   region
}
```

Modified
```
session: {
   cache: {
      engine
   }
}
```

Overrode some local ephemeral env-vars (`.envrc`)

```
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_REGION=eu-west-2
export AWS_DYNAMODB_ENDPOINT=http://localhost:4566
export SESSION_CACHE_ENGINE=dynamodb // comment this for tests to pass
export AWS_DYNAMODB_CREATE_TABLE=true
```

## Code

* `~/src/server/index.js`
  Added a cache object called `storer`
  to access the cache API

* `~/src/server/common/helpers/session-cache/cache-engine.js`
  Imported the `CatboxDynamodb` class.
  Added *dynamodb* as an option.


* `~/src/server/common/plugins/catbox-dynamodb/catbox-dynamodb.js`
  Created `CatboxDynamodb` class.

* `~/src/home/controller.js`
  Lots of try catch.
  Reads from `storer` cache object.
  Stores an array of timestamps.


## CatboxDynamodb class

* Followed similar API to *catbox-redis* and *catbox-memory*.

* Lots of logging whilst debugging, can now be removed.

* Note the IAM creds via `fromNodeProviderChain` from `credential-providers`

* *Endpoint* in config is an important override between localstack and the real thing.

* *Segment* is currently ignored.

* Locally can create the table if needed

* `stop()` does not really have a purpose

* Note the input and output is intercepted by Catbox so `key` is an object
  ```
  key {
   id, segment
  }
  ```
  And response to `get()` has to be:
  ```
  {
   id, item, stored, ttl
  }
  ```


## CDP environment
 (infra-dev)

### IAM Policy

* Clickopsed a new dynamodb policy for the tables
* Added it to the service role

* Infra also clickopsed some gateway. Ticket created to codify in terraform.

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable
information providers in the public sector to license the use and re-use of their information under a common open
licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
