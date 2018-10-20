import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda"
import { Polly, S3 } from "aws-sdk"
import { S3_BUCKET } from "../utils/envs"
import random from "../utils/random"
import { IStringIndexed } from "improved/dist/types"

const textToMp3: Handler = (event: APIGatewayEvent, _: Context, cb: Callback) => {
  const { text }: IStringIndexed = event.queryStringParameters || {}

  const polly = new Polly()
  const params = {
    LexiconNames: [
      "example"
    ],
    OutputFormat: "mp3",
    SampleRate: "8000",
    Text: text,
    TextType: "text",
    VoiceId: "Joanna"
  }
  polly.synthesizeSpeech(params, (err, data) => {
    if (err) console.log(err, err.stack)
    else console.log(data)

    const s3 = new S3()
    const fileName = `polly${random()}.mp3`

    s3.putObject({
      Body: data.AudioStream,
      Bucket: S3_BUCKET!,
      Key: fileName,
      ContentType: "audio/mpeg",
      ACL: "public-read"
    }, (err, data) => {
      if (err) {
        console.log("Error writing to S3", err)
        return cb(err)
      }
      return cb(undefined, {
        statusCode: 200,
        body: JSON.stringify({ url: `https://${S3_BUCKET}.s3.amazonaws.com/${encodeURIComponent(fileName)}` })
      })
    })
  })
}

export default textToMp3
