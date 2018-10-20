import { path as ffmpegPath } from "ffmpeg-static"
import { exec } from "improved/dist/process"

export default async (args: ReadonlyArray<string>) => {
  return exec(`${ffmpegPath} ${args.join(" ")}`)
}
