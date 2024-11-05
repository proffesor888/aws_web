import { APIGatewayEvent, Handler } from "aws-lambda";
import * as stream from "stream";
import * as csv from "csv-parser";
import * as AWS from "aws-sdk";

const s3 = new AWS.S3({ region: "us-east-1" });

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
      Bucket: "servicenkjsfngjknsrjktejt535/uploaded",
      Key: filename,
      ContentType: "text/csv",
    };
    const signedURL = await s3.getSignedUrlPromise("putObject", params);
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
    console.log("Wrong folder");
    return;
  }
  const params = { Bucket: bucket, Key: key };
  try {
    const data = await s3.getObject(params).promise();
    const csvData = data.Body?.toString("utf-8");
    const results: unknown[] = [];
    await new Promise((resolve, reject) => {
      const readableStream = new stream.Readable();
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      readableStream._read = () => {};
      readableStream.push(csvData);
      readableStream.push(null);

      readableStream
        .pipe(csv())
        .on("data", (data: unknown) => results.push(data))
        .on("end", resolve)
        .on("error", reject);
    });

    console.log("Parsed", JSON.stringify(results, null, 2));
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
