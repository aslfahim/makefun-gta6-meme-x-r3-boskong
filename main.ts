// gta6-meme-x-01 round 3 entry for @boskong
// Validates POST.json and copies it to the output directory.
// Meme concept: Vice City parking ticket — VICE CITY PARKING AUTHORITY
// violation notice on yellow ticket stock, red stamp "BOOT APPLIED".

import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const EXPECTED_STATUS_ID: string = "2123973311365628376";
const MAX_POST_BYTES: number = 16384;
const URL_PATTERN: RegExp = /^https:\/\/x\.com\/[A-Za-z0-9_]+\/status\/(\d+)$/;

function fail(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

function main(): void {
  const botDir: string = process.env.MAKEFUN_BOT_DIR ?? "/bot";
  const outputDir: string = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  const postPath: string = join(botDir, "POST.json");

  if (!existsSync(postPath)) {
    fail(`POST.json is missing from bot dir "${botDir}" (looked for ${postPath})`);
  }

  const size: number = statSync(postPath).size;
  if (size > MAX_POST_BYTES) {
    fail(`POST.json is too large: ${size} bytes (max ${MAX_POST_BYTES})`);
  }

  const raw: string = readFileSync(postPath, "utf8");

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    fail("POST.json is not valid JSON");
  }

  const url: unknown = (parsed as { url?: unknown }).url;
  if (typeof url !== "string") {
    fail('POST.json "url" field must be a string');
  }

  const match: RegExpMatchArray | null = url.match(URL_PATTERN);
  if (!match) {
    fail(`POST.json "url" is not a valid X status URL: ${url}`);
  }

  if (match[1] !== EXPECTED_STATUS_ID) {
    fail(`unexpected status id ${match[1]}, expected ${EXPECTED_STATUS_ID}`);
  }

  mkdirSync(outputDir, { recursive: true });
  const dest: string = join(outputDir, "POST.json");
  copyFileSync(postPath, dest);

  console.log(
    "Vice City parking ticket meme verified: parked 5 minutes in 2013, " +
      "meter ran 4,818 days, total $2,026 paid by my AI agent. " +
      `POST.json copied to ${dest}`
  );
}

main();
