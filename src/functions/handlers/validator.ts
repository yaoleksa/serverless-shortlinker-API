const types = {
    '0': 'one-time',
    '1': 'one-day',
    '2': 'three-days',
    '3': 'one-week'
};

function validateUrl(url: string): boolean {
    return /^http:\/\/./.test(url) || /^https:\/\/./.test(url);
}

function emailValidate(email: string): boolean {
    return /.+@.+\..+/.test(email);
}

function pswdValidate(password: string): string {
    if(password.length < 6) {
        return 'Password must have at least 6 characters';
    }
    if(!/\d+/.test(password)) {
        return 'Password must include at least one number';
    }
    if(!/[A-Z]+/.test(password)) {
        return 'Password must include at least one uppercase letter';
    }
    if(!/[a-z]+/.test(password)) {
        return 'Password must include at least one lowercase letter';
    }
    if(!/[\!\@\#\$\%\^\&\*\(\)\_\-\=\+\?\>]+/.test(password)) {
        return 'Password must include at least one special character';
    }
    return 'Success';
}

export { validateUrl, emailValidate, pswdValidate, types };