import { SQSEvent } from "aws-lambda";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const dynamoDBClient = new DynamoDBClient({ region: "us-east-1" });
const snsClient = new SNSClient({ region: "us-east-1" });
const topicArn =
  "arn:aws:sns:us-east-1:376129883738:ProductSnsStack-createProductTopic05C0E62B-Oa01OQxtampv"; // Replace with your actual topic ARN

export async function catalogBatchProcess(event: SQSEvent): Promise<void> {
  console.log("Received message:", event.Records[0].body);
  try {
    for (const record of event.Records) {
      const product = JSON.parse(record.body);
      const params = {
        TableName: "Products",
        Item: {
          id: { S: product.id },
          price: { N: product.price },
          title: { S: product.title },
          description: { S: product.description || "" },
        },
      };

      dynamoDBClient
        .send(new PutItemCommand(params))
        .then(() => console.log(`Product inserted: ${product.id}`))
        .catch((e) => console.log(e));

      const publishParams = {
        TopicArn: topicArn,
        Message: `New product created: ${JSON.stringify(product)}`,
        Subject: "New Product Creation Notification",
      };
      await snsClient.send(new PublishCommand(publishParams));
      console.log(`Notification sent for product ID: ${product.productId}`);
    }
  } catch (error) {
    console.error("Error processing SQS message:", error);
    throw error;
  }
}
