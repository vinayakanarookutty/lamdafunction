import AWS from "aws-sdk"
const dynamodb = new AWS.DynamoDB();
export const handler = async (event) => {
    // TODO implement
    const response = {
      statusCode: 200,
      body: JSON.stringify('Hello from Lambda!'),
    };
    const fileName = event.Records[0].s3.object.key;
    const dotIndex = fileName.indexOf('.');
    const type = fileName.substring(dotIndex + 1);
    const currentTime = new Date().toLocaleString("en-IN", {timeZone: "Asia/Kolkata"});
    
    const params = {
      TableName: 'table123',
      Item: {
        'fileNames': { S: fileName }, // Partition key
        'contentType': { S: type },  // Sort key
        'Time': { S: currentTime }
      }
    };
    await dynamodb.putItem(params).promise();
    console.log("Item added to DynamoDB successfully.");
    return response;
  };
  