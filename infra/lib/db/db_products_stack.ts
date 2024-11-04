import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as cdk from "aws-cdk-lib";
import { join } from "path";

export class DBProductsStack extends Stack {
  constructor(contsruct: Construct, id: string, options?: StackProps) {
    super(contsruct, id, options);

    const productsTable = new dynamodb.Table(this, "Products", {
      tableName: "Products",
      partitionKey: {
        name: "id",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "price",
        type: dynamodb.AttributeType.NUMBER,
      },
    });

    const addMockProducts = new lambda.Function(this, "addMockProducts", {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: "db_products_handler.AddProductsMock",
      code: lambda.Code.fromAsset(join(__dirname, "../", "lambda")),
      environment: {
        TABLE_NAME: "Products",
      },
    });
    productsTable.grantWriteData(addMockProducts);
  }
}
