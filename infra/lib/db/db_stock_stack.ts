import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as cdk from "aws-cdk-lib";
import { join } from "path";

export class DBStockStack extends Stack {
  constructor(contsruct: Construct, id: string, options?: StackProps) {
    super(contsruct, id, options);

    const table = new dynamodb.Table(this, "Stock", {
      tableName: "Stock",
      partitionKey: {
        name: "product_id",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "count",
        type: dynamodb.AttributeType.NUMBER,
      },
    });

    const addMockCount = new lambda.Function(this, "addMockCount", {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: "db_count_handler.AddCountMock",
      code: lambda.Code.fromAsset(join(__dirname, "../", "lambda")),
      environment: {
        TABLE_NAME: "Stock",
      },
    });

    table.grantWriteData(addMockCount);
  }
}
