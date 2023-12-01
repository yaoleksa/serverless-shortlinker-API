import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult } from "aws-lambda";
import bcrypt from 'bcryptjs';

class LoginResult {
    status: boolean;
    message: string;
    constructor(stat, msg) {
        this.status = stat;
        this.message = msg;
    }
}

const encrypt = (pswd: string): string => {
    return bcrypt.hashSync(pswd, bcrypt.genSaltSync(10));
}

const signIn = (pswd: string, hash: string): LoginResult => {
    return bcrypt.compare(pswd, hash, (err, res) => {
        if(err) {
            return new LoginResult(false, err.message);
        }
        return new LoginResult(res, 'success');
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

export { authorize, encrypt, signIn };