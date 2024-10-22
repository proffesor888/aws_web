import { Handler } from "aws-lambda";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const dynamoDB = new DynamoDBClient({ region: process.env.AWS_REGION });
const tableName = process.env.TABLE_NAME as string;

export const AddCountMock: Handler = async () => {
  try {
    const count1 = new PutItemCommand({
      TableName: tableName,
      Item: {
        product_id: { S: "1" },
        count: { N: "2" },
      },
    });

    const count2 = new PutItemCommand({
      TableName: tableName,
      Item: {
        product_id: { S: "2" },
        count: { N: "3" },
      },
    });

    const count3 = new PutItemCommand({
      TableName: tableName,
      Item: {
        product_id: { S: "3" },
        count: { N: "4" },
      },
    });

    const count4 = new PutItemCommand({
      TableName: tableName,
      Item: {
        product_id: { S: "4" },
        count: { N: "5" },
      },
    });

    const count5 = new PutItemCommand({
      TableName: tableName,
      Item: {
        product_id: { S: "5" },
        count: { N: "6" },
      },
    });

    await dynamoDB.send(count1);
    await dynamoDB.send(count2);
    await dynamoDB.send(count3);
    await dynamoDB.send(count4);
    await dynamoDB.send(count5);
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Error adding item to DynamoDB table");
  }
};
