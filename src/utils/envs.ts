const {
  S3_BUCKET
} = process.env

if (
  [
    S3_BUCKET
  ].some(a => a === "" || a === undefined)
) {
  throw new Error(`Envs not set properly: ${JSON.stringify(process.env)}`)
}

export {
  S3_BUCKET
}
