import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { AttributeValue, DynamoDBClient, GetItemCommand, ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { tableName } from '@libs/table';
import ShortUniqueId from 'short-unique-id';
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  GetCommand,
  DeleteCommand
} from "@aws-sdk/lib-dynamodb";

import schema from './schema';
import { types, validateUrl } from './validator';

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);
const uid = new ShortUniqueId({length: 5});

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const all = await dynamo.send(
    new ScanCommand({
      TableName: tableName
    })
  );
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
      const result = await dynamo.send(
        new PutCommand({
          TableName: tableName,
          Item: {
            id: recordId,
            url: event.body.url,
            visit: 0,
            lastVisit: null
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
