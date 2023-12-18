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

> :warning: **There is a URL validator, URL must start from `http://` or `https://` prefix and have at least one character**

URL type is a text which represents the type number. There are four URL types:
<ul>
  <li>0 - is a one-time URL. It means once you follow by created link, the URL will be deleted</li>
  <li>1 - is a one-day URL. It means the expiration term of such a URL is one day. For example, if you create a URL item today, tomorrow it will be deleted</li>
  <li>2 - is a three-day URL. The deletion logic is the same as with a one-day URL, but the expiration term is three days</li>
  <li>3 - is a one-week URL. The expiration term is one week</li>
</ul>
If you have done everything properly the response will look something like this:

***
<pre>{
  "message": "https://ivznyk9rp2.execute-api.us-east-1.amazonaws.com/dev/Smuji",
  "status": {
    "ResponseMetadata": {
      "RequestId": "8d5d59fd-62cd-4a58-9dc1-e5e5c6abbfb7"
    },
    "MessageId": "0100018c7c26c6db-80d46dc4-41b3-4cff-9fbc-5df6608964a9-000000"
  }
}</pre>
***

## Get the list of your items
To get the list of URLs which you created make a GET request with mentioned above header and empty body. The valid response should look something like this:
***
<pre>{
  "Items": [
    {
      "lastVisit": null,
      "id": "38Sdi",
      "url": "https://example.com",
      "type": "one-time",
      "visit": 0
    },
    {
      "lastVisit": "12/13/2023, 8:30:45 AM",
      "id": "pzjxp",
      "url": "https://youtube.com",
      "type": "one-day",
      "visit": 1
    }
  ]
}</pre>
***

## Delete item
If you wanna delete an item you should make an API call to the above-mentioned endpoint with the above-mentioned header
#### Example
Request:

***
<pre>curl -X DELETE https://ivznyk9rp2.execute-api.us-east-1.amazonaws.com/dev/cDdQr -H "Authorization: Bearer eyJraWQiOiJMUExyalwvOXA2b3VsKzRjQnRKcXJVVmM2czlFbmhOTjFHcTFxWTBoeFRKbz0iLCJhbGciOiJSUzI1NiJ9.eyJhdF9oYXNoIjoiVHFIS05iZUM4Zzd1STF6amJPREtKQSIsInN1YiI6IjRhNjkwNWUzLWYxZWMtNDljMC05ZDdiLTFmOTIzMzE5MTlmOSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV8yR0xnakdReDIiLCJjb2duaXRvOnVzZXJuYW1lIjoiNGE2OTA1ZTMtZjFlYy00OWMwLTlkN2ItMWY5MjMzMTkxOWY5Iiwib3JpZ2luX2p0aSI6ImFiNDc2NjNjLTg3M2UtNGIyNC1hM2E2LTc4ZGFjZTQ2NDE0MSIsImF1ZCI6IjQzMmY3cWsxNDVyZjBoYTV1NTYwNW9icHFmIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE3MDI4OTQ5MDQsImV4cCI6MTcwMjg5ODUwNCwiaWF0IjoxNzAyODk0OTA0LCJqdGkiOiJmZTFmMGJkYy1hZjQ0LTRhYWQtYTE5MC1mNTQxYjlmYzliOTIiLCJlbWFpbCI6ImNoZWNrZXJmZnNAZ21haWwuY29tIn0.KAImSoG-RDDr5p4xdbJej-FI44zq7MG-FDoj8S9R_ByE_hzj1RHCITFhct8rvbucxB_4jt9QL9uA2m1NatRlQS8gwdnse_r25QatvNPf1lPLOj2paZjEdypnihZESWh-TminAmRbY5d-f7Q3lq7iInjoz55foxGfMF6Di8zxIWZe6He_5ODB5EsfWSeGHBiXdTcXMJDl73CCtMkJH-gNQTxd7fce1qqNnVL-iDc06Y-8RPXf38U8GsrGCOffpYwi__tXDbzLxqE2U2D8rAMKiCMWx16x0XFSa4eo8eHRQJ0FgIoaONRuiOGzRr__Cr8NgN1U15lcK6FQNJoPJskdxw"</pre>
***

Response:
***
<pre>{
  "$metadata": {
    "httpStatusCode":200,
    "requestId":"B0MQVRO1F2RPIHOJDTV2VN37VVVV4KQNSO5AEMVJF66Q9ASUAAJG",
    "attempts":2,
    "totalRetryDelay":89
  }
}</pre>
***