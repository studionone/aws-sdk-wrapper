'use strict'

const dynamodb = require('./src/dynamodb')
const cognito = require('./src/cognito')

module.exports = {
  dynamodb,
  cognito,
}
