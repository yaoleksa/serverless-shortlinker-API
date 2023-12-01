import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult } from "aws-lambda";
import bcrypt from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';

const encrypt = (pswd: string): string => {
    return bcrypt.hashSync(pswd, bcrypt.genSaltSync(10));
}

const signIn = (mail: string, pswd: string, hash: string): string => {
    if(bcrypt.compareSync(pswd, hash)) {
        return jsonwebtoken.sign({
            email: mail,
            password: hash
        }, '120000');
    } else {
        return null;
    }
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