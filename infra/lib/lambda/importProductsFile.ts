import { APIGatewayEvent, Handler } from "aws-lambda";
import { S3 } from "aws-cdk";
import * as csv from "csv-parser";
// import * as s3 from "aws-cdk-lib/aws-s3";

const s3 = new S3();

interface EventByFileName extends APIGatewayEvent {
  filename: string;
}

export const importProductsFile: Handler = async (event: EventByFileName) => {
  const { filename = "" } = event;
  if (filename.length) {
    return { message: `upload/${filename}` };
  }
  return { message: "test" };
};

export const importFileParser: Handler = async (event) => {
  const bucket = event.Records[0].s3.bucket.name;
  const key = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\\+/g, " ")
  );
  if (!key.startsWith("uploaded/")) {
    return;
  }
  const params = { Bucket: bucket, Key: key };
  const stream = s3.getObject(params).createReadableStream();
  const results: unknown[] = [];

  stream
    .pipe(csv())
    .on("data", (data: unknown) => results.push(data))
    .on("end", () => console.log(results));
};
