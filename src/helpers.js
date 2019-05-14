'use strict'

/**
 * Format a Cognito user property key nicely to match GraphQL schema
 * @param  {string} key - The key to format
 * @return {string}     - The formatted key
 */
const cleanKey = key => (
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
const cleanCognitoKeys = (data) => {
  const { Attributes } = data
  const formattedAttrs = { username: data.Username }

  Attributes.forEach((attr) => {
    formattedAttrs[cleanKey(attr.Name)] = attr.Value
  })

  return formattedAttrs
}

module.exports = {
  cleanCognitoKeys,
  cleanKey,
}
