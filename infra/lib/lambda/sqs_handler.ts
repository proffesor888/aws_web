import { SQSEvent } from "aws-lambda";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const dynamoDBClient = new DynamoDBClient({ region: "us-east-1" });

export async function catalogBatchProcess(event: SQSEvent): Promise<void> {
  console.log("Received message:", event.Records[0].body);
  try {
    for (const record of event.Records) {
      const product = JSON.parse(record.body);
      console.log("Parsed Product", product);
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
    }
  } catch (error) {
    console.error("Error processing SQS message:", error);
    throw error;
  }
}
