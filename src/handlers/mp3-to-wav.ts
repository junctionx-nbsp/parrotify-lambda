import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda"
import ffmpeg from "../utils/ffmpeg"
import { IStringIndexed } from "improved/dist/types"
import { unlink } from "improved/dist/fs"
import random from "../utils/random"
import { S3_BUCKET } from "../utils/envs"
import { S3 } from "aws-sdk"
import { createReadStream, statSync } from "fs"

const mp3ToWav: Handler = async (event: APIGatewayEvent, _: Context, cb: Callback) => {
  const { inputUrl }: IStringIndexed = event.queryStringParameters || {}

  const temporaryFile = `/tmp/${random()}.wav`

  console.log(`Temporary File: ${temporaryFile}`)
  await ffmpeg(["-i", inputUrl, "-acodec", "pcm_alaw", "-ar", "8000", "-ac", "1", temporaryFile])

  console.log(`Done with ffmpeg, file stats: ${JSON.stringify(statSync(temporaryFile))}`)
  const s3 = new S3()
  const fileName = inputUrl.split("/").pop()!.replace(/\.mp3/i, ".wav")

  console.log(`Starting S3 upload to ${S3_BUCKET}/${fileName}`)
  const upload = s3.upload({
    Body: createReadStream(temporaryFile),
    Bucket: S3_BUCKET!,
    Key: fileName,
    ACL: "public-read"
  })
  try {
    const data = await upload.promise()
    cb(undefined, {
      statusCode: 200,
      body: JSON.stringify({
        url: `https://${S3_BUCKET}.s3.amazonaws.com/${encodeURIComponent(fileName)}`
      })
    })
  } catch (e) {
    console.log("Error writing to S3", e)
    cb(e)
  } finally {
    await unlink(temporaryFile)
  }
}

export default mp3ToWav
