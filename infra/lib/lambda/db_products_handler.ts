import { Handler } from "aws-lambda";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";

const dynamoDB = new DynamoDBClient({ region: process.env.AWS_REGION });
const tableName = process.env.TABLE_NAME as string;

export const AddProductsMock: Handler = async () => {
  try {
    const product1 = new PutItemCommand({
      TableName: tableName,
      Item: {
        id: { S: "1" },
        title: { S: "ProductOne" },
        price: { S: "24" },
        description: { S: "Short Product Description1" },
      },
    });

    const product2 = new PutItemCommand({
      TableName: tableName,
      Item: {
        id: { S: "2" },
        title: { S: "ProductTitle" },
        price: { S: "15" },
        description: { S: "Short Product Description7" },
      },
    });

    const product3 = new PutItemCommand({
      TableName: tableName,
      Item: {
        id: { S: "3" },
        title: { S: "Product" },
        price: { S: "23" },
        description: { S: "Short Product Description2" },
      },
    });

    const product4 = new PutItemCommand({
      TableName: tableName,
      Item: {
        id: { S: "4" },
        title: { S: "ProductTest" },
        price: { S: "15" },
        description: { S: "Short Product Description4" },
      },
    });

    const product5 = new PutItemCommand({
      TableName: tableName,
      Item: {
        id: { S: "5" },
        title: { S: "Product2" },
        price: { S: "23" },
        description: { S: "Short Product Descriptio1" },
      },
    });

    await dynamoDB.send(product1);
    await dynamoDB.send(product2);
    await dynamoDB.send(product3);
    await dynamoDB.send(product4);
    await dynamoDB.send(product5);
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Error adding item to DynamoDB table");
  }
};
