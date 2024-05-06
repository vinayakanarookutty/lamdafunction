import AWS from 'aws-sdk';
const dynamodb = new AWS.DynamoDB();
import csvParser from 'csv-parser';
const s3 = new AWS.S3
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
    TableName: 'imageTables',
    Item: {
      'fileNames': { S: fileName }, // Partition key
      'contentType': { S: type },  // Sort key
      'Time': { S: currentTime }
    }
  };

  if(type==="csv"){
    const s3Params = {
      Bucket: "green14",
      Key: event.Records[0].s3.object.key
    };
    const s3ReadStream = s3.getObject(s3Params).createReadStream();
    s3ReadStream
    .pipe(csvParser())
    .on('data', async (data) => {
        // Insert each row of CSV data into DynamoDB
        const currentTime = new Date().toLocaleString("en-IN", {timeZone: "Asia/Kolkata"});
        const dynamoParams = {
            TableName: 'imageTables',
            Item: {
                'fileNames': { S: fileName }, // Partition key
                'contentType': { S: 'csv' },  // Sort key (assuming CSV)
                'Time': { S: currentTime },
                // Assuming your CSV has columns 'col1', 'col2', 'col3'
                'col1': { S: data.col1 },
                'col2': { S: data.col2 },
                'col3': { S: data.col3 }
                // Add more attributes as needed based on your CSV structure
            }
        };

        // Insert data into DynamoDB
          await dynamodb.putItem(dynamoParams).promise();
          console.log("Item added to DynamoDB successfully.");
    })
    .on('end', () => {
        console.log('CSV processing finished.');
        return response; // Respond after all rows have been processed
    });
 

  }
  else{
    try {
      // Call DynamoDB to add the item to the table
      await dynamodb.putItem(params).promise();
      console.log("Item added to DynamoDB successfully.");
    } catch (err) {
      console.error("Unable to add item to DynamoDB. Error:", err);
      return response;
      // You might want to handle the error appropriately here
    }
  }
  
  
  
  console.log("Name:" + fileName, "ContentType:" + type, "Time:" + currentTime);
  
  return response;
};
