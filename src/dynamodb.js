'use strict'

const AWS = require('aws-sdk')

const db = new AWS.DynamoDB.DocumentClient({ region: process.env.AWS_REGION })

/**
 * @namespace dynamodb
 */
const dynamodb = {}

/**
 * Add a new item to a DynamoDB table
 * @param  {string} table - The name of the table to modify
 * @param  {object} args  - The properties to apply to the new item
 * @return {promise}      - A promise that resolves on completion
 */
dynamodb.put = (table, args) => {
  let item = {}
  // Remove empty strings from query
  Object.entries(args).forEach(([key, value]) => {
    if (value !== '') {
      item = {
        ...item,
        [key]: value,
      }
    }
  })

  const params = {
    TableName: table,
    Item: item,
  }

  return new Promise((resolve, reject) => {
    db.put(params, (error, data) => {
      if (error) {
        reject(error)
      } else {
        resolve(data)
      }
    })
  })
}

/**
 * Update an existing item in a DynamoDB table
 * @param  {string} table - The name of the table to modify
 * @param  {string} field - The name of the property to select the item by
 * @param  {object} args  - The new properties to apply to the item
 * @return {promise}      - A promise that resolves on completion
 */
dynamodb.update = (table, field, args) => {
  let expression = 'set'
  let values = {}
  let names = {}

  Object.entries(args).forEach(([key, value]) => {
    // Ignore the primary key
    if (field === key) {
      return
    }

    // Build expression string
    expression += ` #${key} = :${key},`

    // Build values object, removing empty strings
    values = {
      ...values,
      [`:${key}`]: value === '' ? null : value,
    }

    // Build name map
    names = {
      ...names,
      [`#${key}`]: key,
    }
  })

  // Build parameter object, exluding empty values
  let params = {
    TableName: table,
    Key: { [field]: args[field] },
    ReturnValues: 'UPDATED_NEW',
  }
  if (Object.keys(names).length > 0) {
    params = {
      ...params,
      UpdateExpression: expression.replace(/,$/, ''),
      ExpressionAttributeValues: values,
      ExpressionAttributeNames: names,
    }
  }

  return new Promise((resolve, reject) => {
    db.update(params, (error, data) => {
      if (error) {
        reject(error)
      } else {
        resolve(data)
      }
    })
  })
}

/**
 * Select items from a DynamoDB table by matching field value
 * @param  {string} table - The name of the table to select from
 * @param  {string} field - The name of the field to select by
 * @param  {*}      match - The field value to match against
 * @return {promise}      - A promise that resolves on completion
 */
dynamodb.query = (table, field, match) => {
  const params = {
    TableName: table,
    IndexName: `${field}-index`,
    KeyConditionExpression: `#${field} = :${field}`,
    ExpressionAttributeNames: { [`#${field}`]: field },
    ExpressionAttributeValues: { [`:${field}`]: match },
  }

  return new Promise((resolve, reject) => {
    db.query(params, (error, data) => {
      if (error) {
        reject(error)
      } else {
        resolve(data)
      }
    })
  })
}

/**
 * Select an item from a DynamoDB table by matching index
 * @param  {string} table - The name of the table to select from
 * @param  {index}  index - The name of the index to select by
 * @param  {*}      match - The field value to match against
 * @return {promise}      - A promise that resolves on completion
 */
dynamodb.get = (table, index, match) => {
  const params = {
    TableName: table,
    Key: { [index]: match },
  }

  return new Promise((resolve, reject) => {
    db.get(params, (error, data) => {
      if (error) {
        reject(error)
      } else {
        resolve(data)
      }
    })
  })
}

/**
 * Get all values from a DynamoDB table
 * @param  {string} table - The name of the table to select from
 * @return {promise}      - A promise that resolves on completion
 */
dynamodb.scan = (table) => {
  const params = {
    TableName: table,
  }

  return new Promise((resolve, reject) => {
    db.scan(params, (error, data) => {
      if (error) {
        reject(error)
      } else {
        resolve(data)
      }
    })
  })
}

/**
 * Remove an item from a DynamoDB table
 * @param  {string} table - The name of the table to remove from
 * @param  {object} keys  - An object containing key value pairs to match by
 *                          If a sort key is defined on the table, its value
 *                          must be supplied in addition to the hash key
 * @return {promise}      - A promise that resolves on completion
 */
dynamodb.remove = (table, keys) => {
  const params = {
    TableName: table,
    Key: keys,
  }

  return new Promise((resolve, reject) => {
    db.delete(params, (error, data) => {
      if (error) {
        reject(error)
      } else {
        resolve(data)
      }
    })
  })
}

/**
 * Perform an arbitrary database operation using the full API options
 * @param  {string} table  - The name of the table operate on
 * @param  {string} name   - The name of the operation to perform, eg query, scan etc
 * @param  {object} params - A params object as per the DocumentClient API
 *                           The TableName parameter can be omitted
 * @return {promise}       - A promise that resolves on completion
 */
dynamodb.operation = (table, name, params) => (
  new Promise((resolve, reject) => {
    db[name]({ TableName: table, ...params }, (error, data) => {
      if (error) {
        reject(error)
      } else {
        resolve(data)
      }
    })
  })
)

module.exports = dynamodb
