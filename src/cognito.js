'use strict'

const AWS = require('aws-sdk')
const { cleanCognitoKeys } = require('./helpers')

const cog = new AWS.CognitoIdentityServiceProvider({ region: process.env.AWS_REGION })
const errors = require('./errors')

/**
 * @namespace cognito
 */
const cognito = {}

/**
 * Default parameters for Cognito requests
 */
cognito.params = {
  UserPoolId: process.env.COGNITO_USERPOOL_ID,
}

/**
 * Get all users from the specified user group
 * @param  {string} group - The name of the group to fetch users from
 * @return {array}        - An array of users with cleaned properties
 */
cognito.getGroupUsers = (group) => {
  const params = {
    ...cognito.params,
    GroupName: group,
  }

  return new Promise((resolve, reject) => {
    // FIXME: This API method probably returns paginated results
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
    ...cognito.params,
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
 * @param  {string} page - A pagination token for specifying a page of results
 * @return {promise}     - A promise that resolves to the user object with cleaned properties
 */
cognito.getAllUsers = (page = undefined) => {
  const params = {
    ...cognito.params,
    PaginationToken: page,
  }

  return new Promise((resolve, reject) => {
    cog.listUsers(params, (error, data) => {
      if (error) {
        reject(error)
        return
      }

      const users = data.Users.map(cleanCognitoKeys)
      if (data.PaginationToken) {
        // Get next page of users, if available
        cognito.getAllUsers(data.PaginationToken)
          .then((next) => {
            resolve([...users, ...next])
          })
      } else {
        resolve(users)
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
        ...cognito.params,
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
  const emptyValues = [null, undefined]

  return cognito.getUser(id)
    .then((user) => {
      const params = {
        ...cognito.params,
        Username: user.username,
        UserAttributes: Object.entries(attributes)
          // Map attributes and replace null values with empty strings
          .map(([key, value]) => ({
            Name: key,
            Value: emptyValues.includes(value) ? '' : value,
          })),
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
