'use strict'

const subject = require('../helpers')

// Tests for cleanKey()

test('cleanKey for cognito custom prefix removes prefix', () => (
  expect(subject.cleanKey('custom:keyname')).toEqual('keyname')
))

test('cleanKey for cognito sub renames to id', () => (
  expect(subject.cleanKey('sub')).toEqual('id')
))

test('cleanKey for snake case converts to camel case', () => (
  expect(subject.cleanKey('key_name')).toEqual('keyName')
))

// Tests for cleanCognitoKeys()

test('cleanCognitoKeys for input keys maps key names correctly', () => {
  const input = {
    Username: 'a',
    Attributes: [
      { Name: 'sub', Value: 'b' },
      { Name: 'given_name', Value: 'c' },
      { Name: 'family_name', Value: 'd' },
      { Name: 'custom:sqid_token', Value: 'e' },
    ],
  }

  const output = {
    id: 'b',
    username: 'a',
    givenName: 'c',
    familyName: 'd',
    sqidToken: 'e',
  }

  expect(subject.cleanCognitoKeys(input)).toEqual(output)
})
