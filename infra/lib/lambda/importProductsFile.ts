import { APIGatewayEvent, Handler } from "aws-lambda";
import { Readable } from "stream";
import * as csv from "csv-parser";
import * as AWS from "aws-sdk";

const s3 = new AWS.S3();
// const s3 = new aws_s3.Bucket();

interface EventByFileName extends APIGatewayEvent {
  filename: string;
  host: string;
  path: string;
  stage: string;
}

const headers = {
  "Access-Control-Allow-Origin": "*",
};

export const importProductsFile: Handler = async (event: EventByFileName) => {
  const { filename = "", host, path, stage } = event;
  if (filename.length && host && path && stage) {
    const params = {
      Bucket: "servicenkjsfngjknsrjktejt535",
      Key: filename,
    };
    const signedURL = s3.getSignedUrl("putObject", params);
    return {
      headers,
      url: signedURL,
      filename: `uploaded/${filename}`,
    };
  }
  return { headers, message: "data url missing" };
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
      headers,
      statusCode: 200,
      body: "Success",
    };
  } catch (e) {
    return {
      headers,
      statusCode: 500,
      body: { error: e, message: "Failed", params },
    };
  }
};
