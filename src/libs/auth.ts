import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult } from "aws-lambda";
import bcrypt from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';
import * as fs from 'fs';

const encrypt = (pswd: string): string => {
    return bcrypt.hashSync(pswd, bcrypt.genSaltSync(10));
}

const signIn = (mail: string, pswd: string, hash: string): string => {
    if(bcrypt.compareSync(pswd, hash)) {
        const jwToken = jsonwebtoken.sign({
            email: mail,
            password: hash
        }, '120000');
        fs.writeFileSync(`../../tmp/${mail}.env`, `TOKEN=${jwToken}`);
        return jwToken;
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

const authorize = async (event: APIGatewayTokenAuthorizerEvent, user: string): Promise<APIGatewayAuthorizerResult> => {
    const token = event.authorizationToken;
    const storedToken = fs.readFileSync(`../../tmp/${user}.env`).toString().split('=')[1];
    const methodArn = event.methodArn;
    if(token == storedToken) {
        return generatePolicy(user, 'allowed', methodArn);
    } else {
        return null;
    }
}

export { authorize, encrypt, signIn };