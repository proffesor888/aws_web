import { SQSEvent } from "aws-lambda";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const dynamoDBClient = new DynamoDBClient({ region: "us-east-1" });

export async function catalogBatchProcess(event: SQSEvent): Promise<void> {
  console.log("Received message:", event.Records[0].body);
  try {
    for (const record of event.Records) {
      const product = JSON.parse(record.body);

      const params = {
        TableName: "Products",
        Item: {
          id: { S: product.productId },
          price: { S: product.price.toString() },
          title: { N: product.title },
          description: { S: product.description || "" },
        },
      };

      await dynamoDBClient.send(new PutItemCommand(params));
      console.log(`Product inserted: ${product.productId}`);
    }
  } catch (error) {
    console.error("Error processing SQS message:", error);
    throw error;
  }
}
