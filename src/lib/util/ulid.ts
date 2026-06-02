import { customAlphabet } from "nanoid";

const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZabcdefghijkmnpqrstvwxyz_-";
const RANDOM_LEN = 16;
const TIME_LEN = 10;
const randomPart = customAlphabet(ALPHABET, RANDOM_LEN);

export function newId(): string {
  const ts = Date.now().toString(36).padStart(TIME_LEN, "0");
  return ts + randomPart();
}
