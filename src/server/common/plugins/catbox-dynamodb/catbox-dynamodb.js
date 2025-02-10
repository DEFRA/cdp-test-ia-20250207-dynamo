import { applyToDefaults } from '@hapi/hoek'
import {
  DynamoDBClient,
  CreateTableCommand,
  DeleteTableCommand,
  GetItemCommand,
  PutItemCommand,
  DeleteItemCommand
} from '@aws-sdk/client-dynamodb'
import Boom from '@hapi/boom'

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
      if (err.code !== 'ResourceInUseException') {
        throw err
      }
    }
  }

  async stop() {
    const command = new DeleteTableCommand({
      TableName: this.settings.partition
    })
    await this.client.send(command)
  }

  async get(key) {
    const command = new GetItemCommand({
      TableName: this.settings.partition,
      Key: { id: key.segment }
    })

    const result = await this.client.send(command)
    if (!result.Item) {
      return null
    }

    return result.Item.item
  }

  async set(key, value, ttl) {
    const command = new PutItemCommand({
      TableName: this.settings.partition,
      Item: {
        id: key.segment,
        item: value,
        expires: Date.now() + ttl
      }
    })

    await this.client.send(command)
  }

  async drop(key) {
    const command = new DeleteItemCommand({
      TableName: this.settings.partition,
      Key: { id: key.segment }
    })

    await this.client.send(command)
  }
}
