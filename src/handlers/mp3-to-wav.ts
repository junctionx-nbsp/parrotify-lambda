import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda"
import ffmpeg from "../utils/ffmpeg"
import { IStringIndexed } from "improved/dist/types"
import { unlink, getFileName } from "improved/dist/fs"
import random from "../utils/random"
import { resolve } from "path"
import { S3_BUCKET } from "../utils/envs"
import { S3 } from "aws-sdk"
import { createReadStream } from "fs"

const mp3ToWav: Handler = async (event: APIGatewayEvent, _: Context, cb: Callback) => {
  const { inputUrl }: IStringIndexed = event.queryStringParameters || {}

  const temporaryFile = resolve("~/temp", random() + ".wav")
  await ffmpeg(["-i", inputUrl, "-acodec", "pcm_alaw", "-ar", "8000", "-ac", "1", temporaryFile])

  const temporaryFileStream = createReadStream(temporaryFile)
  const s3 = new S3()

  const fileName = inputUrl.split("/").pop()!.replace(/\.mp3/i, ".wav")
  s3.putObject({
    Body: temporaryFileStream,
    Bucket: S3_BUCKET!,
    Key: fileName,
    ContentType: "audio/wav",
    ACL: "public-read"
  }, (err, data) => {
    if (err) {
      console.log("Error writing to S3", err)
      return cb(err)
    }
    cb(undefined, {
      statusCode: 200,
      body: JSON.stringify({ url: `https://${S3_BUCKET}.s3.amazonaws.com/${encodeURIComponent(fileName)}` })
    })

    temporaryFileStream.on("close", async () => {
      await unlink(temporaryFile)
    })
  })
}

export default mp3ToWav
