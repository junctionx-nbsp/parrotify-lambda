import { randomBytes } from "crypto"

export default function random(length: number = 32) {
  return randomBytes(length >> 1).toString("hex")
}
