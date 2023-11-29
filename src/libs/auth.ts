import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult } from "aws-lambda";

const generatePolicy = (principal: string, effect: string, resource: string): APIGatewayAuthorizerResult => {
    return {
        principalId: principal,
        policyDocument: {
            Version: '2012-10-17',
            Statement: [{
                Action: 'execute-api:Invoke',
                Effect: effect,
                Resource: resource
            }]
        }
    }
}

const authorize = async (event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
    const token = event.authorizationToken;
    const methodArn = event.methodArn;
    return {
        principalId: 'user',
        policyDocument: {
            Version: new Date().toISOString(),
            Statement: [{
                Action: 'execute-api:Invoke',
                Effect: 'Allow',
                Resource: methodArn
            }]
        }
    }
}

export default authorize;