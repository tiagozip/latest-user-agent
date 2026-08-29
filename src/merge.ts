import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";

const headerSchema = z.record(z.string(), z.record(z.string(), z.string()));

const dirs = await readdir("fragments");

const fragments = await Promise.all(
  dirs.map(async (dir) => {
    const raw = await readFile(join("fragments", dir, "header.json"), "utf-8");
    return headerSchema.parse(JSON.parse(raw));
  }),
);
const headers: Record<string, Record<string, string>> = Object.assign(
  {},
  ...fragments,
);

const output = Object.fromEntries(
  Object.entries(headers).map(([key, received]) => [key, received["user-agent"]]),
);

await writeFile("header.json", JSON.stringify(headers, null, 4));
await writeFile("output.json", JSON.stringify(output, null, 4));
console.log(Object.keys(output).join("\n"));
