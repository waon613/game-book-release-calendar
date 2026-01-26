import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { dailySyncFunction } from './functions/daily-sync/resource';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  data,
  dailySyncFunction,
});

// Lambda関数にDynamoDBアクセス権限を付与
backend.dailySyncFunction.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: [
      'dynamodb:PutItem',
      'dynamodb:GetItem',
      'dynamodb:Query',
      'dynamodb:UpdateItem',
      'dynamodb:Scan',
    ],
    resources: ['*'],
  })
);
