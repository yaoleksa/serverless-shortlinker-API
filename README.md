# Serverless ShortLinker doc

First of all, you need to <a href="https://shortlinker.auth.us-east-1.amazoncognito.com/login?client_id=432f7qk145rf0ha5u5605obpqf&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=https%3A%2F%2Fivznyk9rp2.execute-api.us-east-1.amazonaws.com%2Fdev%2Fsignin%2F" target="_blank">register</a> a user, after this, you can use your registered before user.

As a result, you will retrieve an identification code in such format: `{"code": "xxxx-xxx-xxx-xxx-xxxx"}`. You can just copy paste this code and use it as a **POST** request body with 
the following endpoint: https://shortlinker.auth.us-east-1.amazoncognito.com/login?client_id=432f7qk145rf0ha5u5605obpqf&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=https%3A%2F%2Fivznyk9rp2.execute-api.us-east-1.amazonaws.com%2Fdev%2Fsignin%2F.

So, if you've done everything properly, now there is a **token**. This token you can use with all the following endpoints:
- POST - https://ivznyk9rp2.execute-api.us-east-1.amazonaws.com/dev/
- POST - https://ivznyk9rp2.execute-api.us-east-1.amazonaws.com/dev/auth
- GET - https://ivznyk9rp2.execute-api.us-east-1.amazonaws.com/dev/
- GET - https://ivznyk9rp2.execute-api.us-east-1.amazonaws.com/dev/{id}
- GET - https://ivznyk9rp2.execute-api.us-east-1.amazonaws.com/dev/signin
- DELETE - https://ivznyk9rp2.execute-api.us-east-1.amazonaws.com/dev/{id}