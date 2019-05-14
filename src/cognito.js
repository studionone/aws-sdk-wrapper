'use strict'

const AWS = require('aws-sdk')
const { cleanCognitoKeys } = require('./helpers')

const cognito = new AWS.CognitoIdentityServiceProvider({ region: process.env.AWS_REGION })
const errors = require('./errors')

const paramDefaults = {
  UserPoolId: process.env.COGNITO_USERPOOL_ID,
}

/**
 * Get all users from the specified user group
 * @param  {string} group - The name of the group to fetch users from
 * @return {array}        - An array of users with cleaned properties
 */
const getGroupUsers = (group) => {
  const params = {
    ...paramDefaults,
    GroupName: group,
  }

  return new Promise((resolve, reject) => {
    cognito.listUsersInGroup(params, (error, data) => {
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
const getUser = (id) => {
  const params = {
    ...paramDefaults,
    Filter: `sub = "${id}"`,
  }

  return new Promise((resolve, reject) => {
    cognito.listUsers(params, (error, data) => {
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
 * Get the current user's ID from the provided identity object
 * @param  {object} identity - The identity object from the Lambda context
 * @return {string}          - The current user's ID or null if not available
 */
const getUserId = (identity) => {
  // Get user ID from Cognito user
  if (identity.sub) {
    return identity.sub
  }

  // Get user ID from identity provider string
  const match = identity.cognitoIdentityAuthProvider.match(/CognitoSignIn:([a-z0-9-]{36})/)
  return match ? match[1] : null
}

/**
 * Get the groups a user belongs to
 * @param  {string} id - The ID of the user to look up
 * @return {array}     - An array of group names
 */
const getUserGroups = identity => (
  getUser(getUserId(identity))
    .then((users) => {
      const params = {
        ...paramDefaults,
        Username: users.username,
      }

      return new Promise((resolve, reject) => {
        cognito.adminListGroupsForUser(params, (error, data) => {
          if (error) {
            reject(error)
          } else {
            resolve(data.Groups.map(group => group.GroupName))
          }
        })
      })
    })
)

module.exports = {
  getGroupUsers,
  getUser,
  getUserGroups,
  getUserId,
}
