import type { ValidatedEventAPIGatewayProxyEvent, ValidatedEventAPIGatewayAuthorizerEvent } from '@libs/api-gateway';
import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { tableName, usersTable } from '@libs/table';
import ShortUniqueId from 'short-unique-id';
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  GetCommand,
  DeleteCommand,
  UpdateCommand
} from "@aws-sdk/lib-dynamodb";

import schema from './schema';
import authSchema from './authSchema';
import { types, validateUrl, emailValidate, pswdValidate } from './validator';
import { encrypt, signIn } from '@libs/auth';

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);
const uid = new ShortUniqueId({length: 5});

//let User; // THIS IS A PROBLEM

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema | typeof authSchema> | 
ValidatedEventAPIGatewayAuthorizerEvent<typeof schema | typeof authSchema> = async (event) => {
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
    if(event.resource.includes('/tables')) {
      const listOfTables = await dynamo.send(new ListTablesCommand({}));
      return formatJSONResponse({
        tablesNames: listOfTables.TableNames
      }, null, 200);
    }
    if(event.resource.includes('signin')) {
      try {
        return formatJSONResponse(event , {}, 200);
      } catch(err) {}
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
      if(event.resource.includes('/signup')) {
        if(!emailValidate(event.body.email)) {
          return formatJSONResponse({
            message: 'Invalid email format'
          }, {
            "Content-Type": "application/json"
          }, 400);
        }
        const passwordValidationResult = pswdValidate(event.body.password);
        if(passwordValidationResult != 'Success') {
          return formatJSONResponse({
            message: passwordValidationResult
          }, {
            "Content-Type": "application/json"
          }, 400);
        }
        let encryptedPassword = encrypt(event.body.password);
        if(!encryptedPassword) {
          return formatJSONResponse({"error": "can't encrypt password"}, { "Content-Type": "application/json" }, 500);
        }
        dynamo.send(new PutCommand({
          TableName: usersTable,
          Item: {
            email: event.body.email,
            password: encryptedPassword
          }
        }));
        return formatJSONResponse({ token: signIn(event.body.email, event.body.password, encryptedPassword) }, { "Content-Type": "application/json" }, 201);
      }
      if(event.resource.includes('/signin')) {
        const creds = await dynamo.send(new GetCommand({
          TableName: usersTable,
          Key: {
            email: event.body.email
          }
        }));
        try {
          if(!creds) {
            return formatJSONResponse({
              message: "There is no such user in the database. Sign up firstly"
            }, {
              "Content-Type": "application/json"
            }, 400);
          }
          const token = signIn(event.body.email, event.body.password, creds.Item.password);
          if(token) {
            return formatJSONResponse({
              token: token
            }, {
              "Content-Type": "application/json"
            }, 200);
          } else {
            return formatJSONResponse({
              message: 'Invalid credentials'
            }, {
              "Content-Type": "application/json"
            }, 400);
          }
        } catch(ex) { return formatJSONResponse({message: ex.message}, {}, 400); }
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
