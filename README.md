# Serverless ShortLinker doc

First of all, you need to <a href="https://shortlinker.auth.us-east-1.amazoncognito.com/login?client_id=432f7qk145rf0ha5u5605obpqf&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=https%3A%2F%2Fivznyk9rp2.execute-api.us-east-1.amazonaws.com%2Fdev%2Fsignin%2F" target="_blank">register</a> a user, after this, you can use your registered before user.

As a result, you will retrieve an identification code in such format: `{"code": "xxxx-xxx-xxx-xxx-xxxx"}`. You can just copy paste this code and use it as a **POST** request body with 
the following endpoint: https://ivznyk9rp2.execute-api.us-east-1.amazonaws.com/dev/auth.

So, if you've done everything properly, now there is a **token**. This token you can use with all the following endpoints:
- POST - https://ivznyk9rp2.execute-api.us-east-1.amazonaws.com/dev/
- GET - https://ivznyk9rp2.execute-api.us-east-1.amazonaws.com/dev/
- DELETE - https://ivznyk9rp2.execute-api.us-east-1.amazonaws.com/dev/{id}

The **token** you have to put in the request header as an **Authorization** property in the following format: Bearer *your_token*

## Proper request body and header
When you POST a new url item to the database you should construct the proper body and header of the request. As mentioned above it's critically important to add headers' Authorization in the following format:
***
<pre>{
    Authorization: Bearer YOUR_TOKEN RETRIEVED AT THE PREVIOUS STEP
}</pre>
***
The Body of a POST request should have the following format:
***
<pre>{
    "url":"URL IN THE VALID FORMAT",
    "type":"ONE OF THE ALLOWED TYPES"
}</pre>
***
> :warning: **There is a url validator, url must start from `http://` or `https://` prefix and has at leaest one character**
The response will look something like this:
***
<pre>{
  "message": "https://ivznyk9rp2.execute-api.us-east-1.amazonaws.com/dev/mkm5o"
}</pre>
***
