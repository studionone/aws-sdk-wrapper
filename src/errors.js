'use strict'

class UserAccessViolationError extends Error {
  constructor () {
    super()
    this.name = 'UserAccessViolationError'
    this.message = 'This user doesn\'t have permission to access the requested resource'
  }
}

class RegoConflictError extends Error {
  constructor () {
    super()
    this.name = 'RegoConflictError'
    this.message = 'This plate is already registered'
  }
}

class UserNotFoundError extends Error {
  constructor () {
    super()
    this.name = 'UserNotFoundError'
    this.message = 'The requested user does not exist'
  }
}

module.exports = {
  UserAccessViolationError,
  RegoConflictError,
  UserNotFoundError,
}
