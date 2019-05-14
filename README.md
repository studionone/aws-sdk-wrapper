# AWS JavaScript SDK wrapper

This project contains wrappers for useful parts of the AWS SDK, which makes them easier to use in general projects.

## DynamoDB wrapper

The module `dynamodb.js` includes wrappers for the `put`, `update`, `query`, `get`, `scan` and `delete` methods of the class `AWS.DynamoDB.DocumentClient`.

## Cognito wrapper

The module `cognito.js` includes a wrapper for the `listUsersInGroup` and `adminListGroupsForUser` methods of the class `AWS.CognitoIdentityServiceProvider`. It also provides a `getUser` function that makes use of the `listUsers` method.
