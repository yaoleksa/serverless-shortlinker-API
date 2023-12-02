import type { APIGatewayProxyEvent, 
  APIGatewayProxyResult, 
  APIGatewayTokenAuthorizerEvent,
  APIGatewayAuthorizerResult, 
  Handler } from "aws-lambda"
import type { FromSchema } from "json-schema-to-ts";

type ValidatedAPIGatewayProxyEvent<S> = Omit<APIGatewayProxyEvent, 'body'> & { body: FromSchema<S> | any }
type ValidatedAPIGatewayAuthorizerEvent<S> = Omit<APIGatewayTokenAuthorizerEvent, 'body'> & 
{ body: FromSchema<S> | any}
export type ValidatedEventAPIGatewayProxyEvent<S> = Handler<ValidatedAPIGatewayProxyEvent<S>, 
APIGatewayProxyResult>
export type  ValidatedEventAPIGatewayAuthorizerEvent<S> = Handler<ValidatedAPIGatewayAuthorizerEvent<S>,
APIGatewayAuthorizerResult>

export const formatJSONResponse = (response: Record<string, unknown>, headers: Record<string, string>, code: number) => {
  return {
    statusCode: code,
    headers,
    body: JSON.stringify(response)
  }
}
