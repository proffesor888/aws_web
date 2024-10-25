import { Handler, APIGatewayEvent } from "aws-lambda";
import {
  DynamoDBClient,
  ScanCommand,
  AttributeValue,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

// Create a Document client to interact directly with DynamoDB tables in a more JavaScript-friendly manner

const client = new DynamoDBClient();

interface EventById extends APIGatewayEvent {
  id: string;
}

const products = [
  {
    description: "Short Product Description1",
    id: "7567ec4b-b10c-48c5-9345-fc73c48a80aa",
    price: 24,
    title: "ProductOne",
  },
  {
    description: "Short Product Description7",
    id: "7567ec4b-b10c-48c5-9345-fc73c48a80a1",
    price: 15,
    title: "ProductTitle",
  },
  {
    description: "Short Product Description2",
    id: "7567ec4b-b10c-48c5-9345-fc73c48a80a3",
    price: 23,
    title: "Product",
  },
  {
    description: "Short Product Description4",
    id: "7567ec4b-b10c-48c5-9345-fc73348a80a1",
    price: 15,
    title: "ProductTest",
  },
  {
    description: "Short Product Descriptio1",
    id: "7567ec4b-b10c-48c5-9445-fc73c48a80a2",
    price: 23,
    title: "Product2",
  },
  {
    description: "Short Product Description7",
    id: "7567ec4b-b10c-45c5-9345-fc73c48a80a1",
    price: 15,
    title: "ProductName",
  },
];

export const main: Handler = async (event: APIGatewayEvent) => {
  return {
    message: `Event message ${JSON.stringify(event)}`,
  };
};

// export const getProductsList = async () => {
//   return {
//     headers: {
//       "Access-Control-Allow-Origin": "*",
//     },
//     products,
//   };
// };

export const getProductsList = async () => {
  const input = {
    TableName: "Products",
  };
  try {
    const { Items } = await client.send(new ScanCommand(input));
    if (Items) {
      const untyped = Items.map((i) => unmarshall(i));
      return {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        products: JSON.stringify(untyped),
      };
    }
    return {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      products: [],
    };
  } catch (e) {
    console.error("Error fetching from DynamoDB:", e);
    throw e;
  }
};

export const getAllStock = async () => {
  const tableProps = {
    TableName: "Stock",
  };
  try {
    const { Items } = await client.send(new ScanCommand(tableProps));
    if (Items) {
      const untyped = Items.map((i) => unmarshall(i));
      return {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        stock: JSON.stringify(untyped),
      };
    }
    return {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      stock: [],
    };
  } catch (e) {
    console.error("Error fetching from DynamoDB:", e);
    throw e;
  }
};

export const getProductById = async (event: EventById) => {
  const id = event.id || "";
  const headers = {
    "Access-Control-Allow-Origin": "*",
  };
  if (id.length) {
    const product = products.find((product) => product.id === id);
    return {
      headers,
      product,
    };
  }
  return {
    headers,
    product: {},
  };
};
