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

const authorize = (event, user: string): boolean => {
    return fs.readdirSync('../../tmp').includes(`${user}.env`) && 
    fs.readFileSync(`../../tmp/${user}.env`).toString().split[1] == event.headers.authorize.match(/\s.+$/g)[0].trim();
};

export { authorize, encrypt, signIn };