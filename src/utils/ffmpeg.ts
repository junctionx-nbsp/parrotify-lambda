import { path as ffmpegPath } from "ffmpeg-static"
import { exec } from "improved/dist/process"
import "ffmpeg-static/bin/linux/x64/ffmpeg"

export default async (args: ReadonlyArray<string>) => {
  return exec(`${ffmpegPath} ${args.join(" ")}`)
}
