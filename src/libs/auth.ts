import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult } from "aws-lambda";
import bcryptjs from 'bcryptjs';

class Result {
    message: string;
    status: boolean;
    constructor(stat, msg) {
        this.message = msg,
        this.status = stat;
    }
}

const encrypt = (pswd: string): Result => {
    return bcryptjs.hash(pswd, 10, (err, hash) => {
        if(err) {
            return new Result(false, err.message);
        }
        if(hash) {
            return new Result(true, hash);
        }
    });
}

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
    return generatePolicy('user', 'allowed', methodArn);
}

export { authorize, encrypt };