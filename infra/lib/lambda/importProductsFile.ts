import { APIGatewayEvent, Handler } from "aws-lambda";
import * as AWS from "aws-sdk";
import { Readable } from "stream";
import * as csv from "csv-parser";

const s3 = new AWS.S3();
// const s3 = new aws_s3.Bucket();

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
  try {
    const data = await s3.getObject(params).promise();
    const results: unknown[] = [];
    if (data.Body instanceof Readable) {
      data.Body.pipe(csv())
        .on("data", (data: unknown) => results.push(data))
        .on("end", () => console.log(results));
    }
    return {
      statusCode: 200,
      body: "Success",
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: "Failed",
    };
  }
};
