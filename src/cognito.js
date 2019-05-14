'use strict'

const AWS = require('aws-sdk')
const { cleanCognitoKeys } = require('./helpers')

const cog = new AWS.CognitoIdentityServiceProvider({ region: process.env.AWS_REGION })
const errors = require('./errors')

const paramDefaults = {
  UserPoolId: process.env.COGNITO_USERPOOL_ID,
}

/**
 * @namespace cognito
 */
const cognito = {}

/**
 * Get all users from the specified user group
 * @param  {string} group - The name of the group to fetch users from
 * @return {array}        - An array of users with cleaned properties
 */
cognito.getGroupUsers = (group) => {
  const params = {
    ...paramDefaults,
    GroupName: group,
  }

  return new Promise((resolve, reject) => {
    cog.listUsersInGroup(params, (error, data) => {
      if (error) {
        reject(error)
      } else {
        resolve(data.Users.map(cleanCognitoKeys))
      }
    })
  })
}

/**
 * Get a user from the specified user ID
 * @param  {string} id - The id of the user to fetch
 * @return {object}    - The user object with cleaned properties
 */
cognito.getUser = (id) => {
  const params = {
    ...paramDefaults,
    Filter: `sub = "${id}"`,
  }

  return new Promise((resolve, reject) => {
    cog.listUsers(params, (error, data) => {
      if (error) {
        reject(error)
      } else if (data.Users.length === 0) {
        reject(new errors.UserNotFoundError())
      } else {
        resolve(cleanCognitoKeys(data.Users[0]))
      }
    })
  })
}

/**
 * Get the groups a user belongs to
 * @param  {string} id - The ID of the user to look up
 * @return {array}     - An array of group names
 */
cognito.getUserGroups = id => (
  cognito.getUser(id)
    .then((users) => {
      const params = {
        ...paramDefaults,
        Username: users.username,
      }

      return new Promise((resolve, reject) => {
        cog.adminListGroupsForUser(params, (error, data) => {
          if (error) {
            reject(error)
          } else {
            resolve(data.Groups.map(group => group.GroupName))
          }
        })
      })
    })
)

module.exports = cognito
