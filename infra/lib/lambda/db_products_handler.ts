import { Handler } from "aws-lambda";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const dynamoDB = new DynamoDBClient({ region: process.env.AWS_REGION });
const tableName = process.env.TABLE_NAME as string;

export const AddProductsMock: Handler = async () => {
  try {
    const product1 = new PutItemCommand({
      TableName: tableName,
      Item: {
        id: { S: "1" },
        title: { S: "ProductOne" },
        price: { N: "24" },
        description: { S: "Short Product Description1" },
      },
    });

    const product2 = new PutItemCommand({
      TableName: tableName,
      Item: {
        id: { S: "2" },
        title: { S: "ProductTitle" },
        price: { N: "15" },
        description: { S: "Short Product Description7" },
      },
    });

    const product3 = new PutItemCommand({
      TableName: tableName,
      Item: {
        id: { S: "3" },
        title: { S: "Product" },
        price: { N: "23" },
        description: { S: "Short Product Description2" },
      },
    });

    const product4 = new PutItemCommand({
      TableName: tableName,
      Item: {
        id: { S: "4" },
        title: { S: "ProductTest" },
        price: { N: "15" },
        description: { S: "Short Product Description4" },
      },
    });

    const product5 = new PutItemCommand({
      TableName: tableName,
      Item: {
        id: { S: "5" },
        title: { S: "Product2" },
        price: { N: "23" },
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

export const createProduct: Handler = async (event) => {
  const { title = "", price = "", description = "" } = event;
  const idN = Math.floor(Math.random() * (1000 - 1 + 1) + 1);
  if (!title.length || !price.length || !description.length) {
    return;
  }
  const params = new PutItemCommand({
    TableName: tableName,
    Item: {
      id: { S: `${idN}` },
      title: { S: `${title}` },
      price: { N: `${price}` },
      description: { S: `${description}` },
    },
  });
  try {
    await dynamoDB.send(params);
  } catch (error) {
    console.error("Error:", error);
    throw new Error(`${error}`);
  }
};
