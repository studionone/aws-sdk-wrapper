'use strict'

class UserNotFoundError extends Error {
  constructor () {
    super()
    this.name = 'UserNotFoundError'
    this.message = 'The requested user does not exist'
  }
}

module.exports = {
  UserNotFoundError,
}
