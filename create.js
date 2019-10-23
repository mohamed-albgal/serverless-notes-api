import uuid from "uuid";
import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";


export async function main(event, context) {
  const data = JSON.parse(event.body);
  const params = {
    TableName: process.env.tableName,
    Item: {
      userId: event.requestContext.identity.cognitoIdentityId,
      noteId: uuid.v1(),
      content: data.content,
      attachment: data.attachment,
      createdAt: Date.now()
    }
  };

  try {
    await dynamoDbLib.call("put", params);
    return success(params.Item);
  } catch (e) {
    console.log(e);
    return failure({ status: false });
  }
}
/*

--- before refactor---
import uuid from "uuid";
import AWS from "aws-sdk";
//the region is inferred by the sdk from the lambda, make sure its the right region, ensure:
AWS.config.update({region:"us-west-2"});

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export function main(event, context, callback) {
  // Request body is passed in as a JSON encoded string in 'event.body'
  const data = JSON.parse(event.body);

  const params = {
    TableName: process.env.tableName,
    Item: {
      userId: event.requestContext.identity.cognitoIdentityId,
      noteId: uuid.v1(),
      content: data.content,
      attachment: data.attachment,
      createdAt: Date.now()
    }
  };

  dynamoDb.put(params, (error, data) => {
    // Set response headers to enable Cross-Origin Resource Sharing
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true
    };

    // Return status code 500 on error
    if (error) {
      const response = {
        statusCode: 500,
        headers: headers,
        body: JSON.stringify({ status: false })
      };
      callback(null, response);
      return;
    }

    // Return status code 200 and the newly created item
    const response = {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify(params.Item)
    };
    callback(null, response);
  });
}*/

/*

The AWS JS SDK assumes the region based on the current region of the Lambda function. So if your DynamoDB table is in a different region, make sure to set it by calling AWS.config.update({ region: "my-region" }); before initilizing the DynamoDB client.
Parse the input from the event.body. This represents the HTTP request parameters.
We read the name of our DynamoDB table from the environment variable using process.env.tableName. We’ll be setting this in our serverless.yml below. We do this so we won’t have to hardcode it in every function.
The userId is a Federated Identity id that comes in as a part of the request. This is set after our user has been authenticated via the User Pool. We are going to expand more on this in the coming chapters when we set up our Cognito Identity Pool. However, if you want to use the user’s User Pool user Id; take a look at the Mapping Cognito Identity Id and User Pool Id chapter.
Make a call to DynamoDB to put a new object with a generated noteId and the current date as the createdAt.
Upon success, return the newly created note object with the HTTP status code 200 and response headers to enable CORS (Cross-Origin Resource Sharing).
And if the DynamoDB call fails then return an error with the HTTP status code 500.

*/