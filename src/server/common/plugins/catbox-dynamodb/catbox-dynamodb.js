import { applyToDefaults } from '@hapi/hoek'
import Boom from '@hapi/boom'
import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand
} from '@aws-sdk/client-dynamodb'
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand
} from '@aws-sdk/lib-dynamodb'

import { config } from '~/src/config/config.js'

const internals = {
  defaults: {
    endpoint: config.get('aws.dynamodb.endpoint'),
    partition: config.get('aws.dynamodb.tableName'),
    createTable: config.get('aws.dynamodb.createTable'),
    ttl: config.get('session.cache.ttl'),
    region: config.get('aws.region'),
    readCapacityUnits: 5,
    writeCapacityUnits: 5
  }
}

export class CatboxDynamodb {
  constructor(options = {}) {
    this.settings = applyToDefaults(internals.defaults, options)
    this.client = new DynamoDBClient({
      region: this.settings.region,
      endpoint: this.settings.endpoint
    })
    this.docClient = DynamoDBDocumentClient.from(this.client)
  }

  validateSegmentName(name) {
    if (!name) {
      throw new Boom.Boom('Empty string')
    }
    if (name.indexOf('\u0000') !== -1) {
      throw new Boom.Boom('Includes null character')
    }
    return null
  }

  isReady() {
    return true
    //  const command = new DescribeTableCommand({
    //    TableName: this.settings.partition
    //  })
    //  return this.client
    //    .send(command)
    //    .then(() => true)
    //    .catch((err) => {
    //      if (err.name === 'ResourceNotFoundException') {
    //        return false
    //      }
    //      throw err
    //    })
  }

  async start() {
    if (!this.settings.createTable) {
      return
    }
    const command = new CreateTableCommand({
      TableName: this.settings.partition,
      KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
      AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
      ProvisionedThroughput: {
        ReadCapacityUnits: this.settings.readCapacityUnits,
        WriteCapacityUnits: this.settings.writeCapacityUnits
      }
    })

    try {
      await this.client.send(command)
    } catch (err) {
      if (err.name !== 'ResourceInUseException') {
        throw err
      }
    }
  }

  async stop() {
    // intentionally empty
  }

  async get(key) {
    const command = new GetCommand({
      TableName: this.settings.partition,
      Key: { id: key.id }
    })

    const result = await this.docClient.send(command)
    if (!result.Item) {
      return null
    }
    const item = result.Item
    return {
      ...item,
      ttl: item.expires - Date.now()
    }
  }

  async set(key, value, ttl) {
    const command = new PutCommand({
      TableName: this.settings.partition,
      Item: {
        id: key.id,
        item: value,
        stored: Date.now(),
        expires: Date.now() + (ttl ?? this.settings.ttl)
      }
    })

    await this.docClient.send(command)
  }

  async drop(key) {
    const command = new DeleteCommand({
      TableName: this.settings.partition,
      Key: { id: key.id }
    })

    await this.client.docClient(command)
  }
}
