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
        }, '120000');;
    } else {
        return null;
    }
}

export { encrypt, signIn };