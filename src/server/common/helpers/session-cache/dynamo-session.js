import AWS from 'aws-sdk'
import { v4 as uuidv4 } from 'uuid'

AWS.config.update({ region: 'eu-west-2' })

const dynamoDB = new AWS.DynamoDB.DocumentClient()
const tableName = 'session-cache'

const createSession = async (userId) => {
  const sessionId = uuidv4()
  const params = {
    TableName: tableName,
    Item: {
      sessionId,
      userId,
      createdAt: new Date().toISOString()
    }
  }

  await dynamoDB.put(params).promise()
  return sessionId
}

const getSession = async (sessionId) => {
  const params = {
    TableName: tableName,
    Key: { sessionId }
  }

  const result = await dynamoDB.get(params).promise()
  return result.Item
}

const updateSession = async (sessionId, data) => {
  const params = {
    TableName: tableName,
    Key: { sessionId },
    UpdateExpression: 'set #data = :data',
    ExpressionAttributeNames: {
      '#data': 'data'
    },
    ExpressionAttributeValues: {
      ':data': data
    },
    ReturnValues: 'UPDATED_NEW'
  }

  const result = await dynamoDB.update(params).promise()
  return result.Attributes
}

const deleteSession = async (sessionId) => {
  const params = {
    TableName: tableName,
    Key: { sessionId }
  }

  await dynamoDB.delete(params).promise()
}
