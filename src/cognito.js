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
 * @return {promise}   - A promise that resolves to the user object with cleaned properties
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
 * Get all users from the user pool
 * @return {promise}   - A promise that resolves to the user object with cleaned properties
 */
cognito.getAllUsers = () => {
  const params = {
    ...paramDefaults,
  }

  return new Promise((resolve, reject) => {
    cog.listUsers(params, (error, data) => {
      if (error) {
        reject(error)
      } else {
        resolve(cleanCognitoKeys(data.Users))
      }
    })
  })
}

/**
 * Get the groups a user belongs to
 * @param  {string} id - The ID of the user to look up
 * @return {promise}   - A promise that resolves to an array of group names
 */
cognito.getUserGroups = id => (
  cognito.getUser(id)
    .then((user) => {
      const params = {
        ...paramDefaults,
        Username: user.username,
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

/**
 * Update a user's Cognito attributes
 * @param  {string} id         - The ID of the user to edit
 * @param  {object} attributes - The attributes to change
 * @return {promise}           - A promisethat resolves on completion
 */
cognito.updateUserAttributes = (id, attributes) => {
  cognito.getUser()
    .then((user) => {
      const params = {
        ...paramDefaults,
        Username: user.username,
        UserAttributes: attributes,
      }

      return new Promise((resolve, reject) => {
        cog.adminUpdateUserAttributes(
          params,
          (error) => {
            if (error) {
              reject(error)
            } else {
              resolve()
            }
          }
        )
      })
    })
}

module.exports = cognito
