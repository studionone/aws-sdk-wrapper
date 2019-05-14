'use strict'

/**
 * @namespace helpers
 */
const helpers = {}

/**
 * Format a Cognito user property key nicely to match GraphQL schema
 * @param  {string} key - The key to format
 * @return {string}     - The formatted key
 */
helpers.cleanKey = key => (
  key
    .replace(/^sub$/, 'id')
    .replace(/(_\w)/g, match => match[1].toUpperCase())
    .replace('custom:', '')
)

/**
 * Map Cognito attributes into an array with friendly names
 * @param  {array} data - An array of custom attributes from Cognito
 * @return {array}      - An array of attributes with formatted keys
 */
helpers.cleanCognitoKeys = (data) => {
  const { Attributes } = data
  const formattedAttrs = { username: data.Username }

  Attributes.forEach((attr) => {
    formattedAttrs[helpers.cleanKey(attr.Name)] = attr.Value
  })

  return formattedAttrs
}

module.exports = helpers
