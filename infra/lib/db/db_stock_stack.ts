import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export class DBStockStack extends Stack {
  constructor(contsruct: Construct, id: string, options?: StackProps) {
    super(contsruct, id, options);

    new dynamodb.Table(this, "Stock", {
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
  }
}
