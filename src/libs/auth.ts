import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda';
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

const authorize = async (event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
    const token = event.authorizationToken;
    if(token)
    return {
        principalId: 'user',
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: 'Deny',
                    Resource: event.methodArn,
                },
            ],
        },
    };
};

export { authorize, encrypt, signIn };