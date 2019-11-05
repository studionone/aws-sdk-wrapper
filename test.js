'use strict'

const { cognito } = require('./index')

cognito.getAllUsers()
  .then((users) => {
    console.log(users.length)
  })
