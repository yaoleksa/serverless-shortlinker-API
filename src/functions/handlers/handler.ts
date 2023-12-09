import type { ValidatedEventAPIGatewayProxyEvent, ValidatedEventAPIGatewayAuthorizerEvent } from '@libs/api-gateway';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { tableName } from '@libs/table';
import ShortUniqueId from 'short-unique-id';
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  GetCommand,
  DeleteCommand,
  UpdateCommand
} from "@aws-sdk/lib-dynamodb";
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import axios from 'axios';
import schema from './schema';
import authSchema from './authSchema';
import { types, validateUrl } from './validator';

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);
const uid = new ShortUniqueId({length: 5});

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema | typeof authSchema> | 
ValidatedEventAPIGatewayAuthorizerEvent<typeof schema | typeof authSchema> = async (event) => {
  switch(event.httpMethod) {
    case 'GET':
      if(event.resource.includes('id')) {
        try {
          const response = await dynamo.send(
            new GetCommand({
              TableName: tableName,
              Key: {
                id: event.pathParameters.id
              }
            })
          );
          const eventClient = new EventBridgeClient({});
          if(response.Item.type == 'one-time') {
            dynamo.send(
              new DeleteCommand({
                TableName: tableName,
                Key: {
                  id: response.Item.id
                }
              })
            );
          } else {
            dynamo.send(
              new UpdateCommand({
                TableName: tableName,
                Key: {
                  id: response.Item.id
                },
                UpdateExpression: "set visit = :numberOfVisit, lastVisit = :currentDate",
                ExpressionAttributeValues: {
                  ":numberOfVisit": response.Item.visit + 1,
                  ":currentDate": new Date().toLocaleString()
                }
              })
            );
          }
          // if(response.Item.type == 'one-day') {
          //   eventClient.send(new PutEventsCommand({
          //     Entries: [{
          //       Detail: JSON.stringify({message: 'After one day expires'}),
          //       DetailType: null,
          //       Source: null
          //     }]
          //   }));
          // } else if(response.Item.type == 'three-days') {
          //   eventClient.send(new PutEventsCommand({
          //     Entries: [{
          //       Detail: JSON.stringify({message: 'After three days expires'}),
          //       DetailType: null,
          //       Source: null
          //     }]
          //   }));
          // } else {
          //   eventClient.send(new PutEventsCommand({
          //     Entries: [{
          //       Detail: JSON.stringify({msg: 'expires after one week'}),
          //       DetailType: null,
          //       Source: null
          //     }]
          //   }));
          // }
          return formatJSONResponse(null, {
            Location: response.Item.url
          }, 302);
        } catch(error) {
          return formatJSONResponse({
            message: error.message,
            code: error.code
          }, null, error.code);
        }
    }
    if(event.resource.includes('signin')) {
      try {
        return formatJSONResponse({
          code: event.queryStringParameters ? event.queryStringParameters.code : null
        } , {
          "Content-Type": "application/json"
        }, 200);
      } catch(err) {}
    }
    const all = await dynamo.send(new ScanCommand({
      TableName: tableName,
      FilterExpression: 'email = :f',
      ExpressionAttributeValues: {
        ":f": {S: event.requestContext.authorizer.claims.email}
      }
    }));
    const result = {};
    for(let item of all.Items) {
      result[item.id] = {
        url: item.url,
        type: item.type,
        numderOfVisit: item.visit,
        lastVisit: item.lastVisit
      };
    }
    return formatJSONResponse(result, null, 200);
    case 'POST':
      if(event.resource.includes('auth')) {
        const tokens = await axios.post('https://shortlinker.auth.us-east-1.amazoncognito.com/oauth2/token', {
          "grant_type": "authorization_code",
          "client_id": "432f7qk145rf0ha5u5605obpqf",
          "code": event.body.code,
          "redirect_uri": "https://ivznyk9rp2.execute-api.us-east-1.amazonaws.com/dev/signin/"
        }, {
          headers: {
            "Authorization": 'Basic NDMyZjdxazE0NXJmMGhhNXU1NjA1b2JwcWY6MTloZjE3OGU5djZnbnBqZmVna21kcjI5cmIycmM3MnEyZjRkMWM4dmViODZlYmpxbGwx',
            "Content-Type": "application/x-www-form-urlencoded"
          }
        });
        return formatJSONResponse({
          token: tokens.data.id_token
        }, {
          "Content-Type": "application/json"
        }, 200);
      }
      let recordId = uid.rnd();
      try {
      const existingRecord = all.Items.find(e => e.url == event.body.url);
      const contextPath = event.requestContext.path.match(/.$/)[0] == '/' ? event.requestContext.path : event.requestContext.path + '/';
      if(existingRecord) {
        return formatJSONResponse({
          message: event.headers['CloudFront-Forwarded-Proto'] + '://' + event.headers.Host + contextPath + existingRecord.id
        }, null, 200);
      }
      while(all.Items.find(e => e.id == recordId)) {
        recordId = uid.rnd();
      }
      if(!types[event.body.type]) {
        return formatJSONResponse({ 
          message: 'Invalid link type' 
        }, null, 403);
      }
      if(!validateUrl(event.body.url)) {
        return formatJSONResponse({
          message: 'Invalid url format'
        }, null, 403);
      }
      await dynamo.send(
        new PutCommand({
          TableName: tableName,
          Item: {
            id: recordId,
            url: event.body.url,
            type: types[event.body.type],
            visit: 0,
            lastVisit: null,
            email: event.requestContext.authorizer.claims.email
          }
        })
      );
      return formatJSONResponse({
        message: event.headers['CloudFront-Forwarded-Proto'] + '://' + event.headers.Host + contextPath + recordId
      }, null, 201);
    } catch(error) {
      return formatJSONResponse({
        message: error.message
      }, null, 409);
    }
    case 'DELETE':
      const response = await dynamo.send(
        new DeleteCommand({
          TableName: tableName,
          Key: {
            id: event.pathParameters.id
          }
        })
      );
      return formatJSONResponse(response, null, 202);
  }
};

export const main = middyfy(handler);
