import type { AWS } from '@serverless/typescript';
import handler from '@functions/handlers';

const serverlessConfiguration: AWS = {
  service: 'shortlinker',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
    httpApi: {
      authorizers: {
        authHandler: {
          type: 'jwt',
          name: 'authorizaer',
          identitySource: '$request.header.Authorization',
          issuerUrl: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_2GLgjGQx2',
          audience: 'audience'
        }
      }
    }
  },
  // import the function via paths
  functions: { handler },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
