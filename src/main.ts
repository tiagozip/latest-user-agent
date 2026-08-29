import { readFile, writeFile } from "node:fs/promises";
import { type WebDriver } from "selenium-webdriver";
import { z } from "zod";
import { setUpBrowser } from "./browser";
import { server } from "./server";

const env = z
  .object({
    CHROME_PATH: z.string().optional(),
    EDGE_PATH: z.string().optional(),
    FIREFOX_PATH: z.string().optional(),
  })
  .parse(process.env);

const pages = {
  fetch: await readFile(new URL("./fetch.html", import.meta.url), "utf-8"),
  xhr: await readFile(new URL("./xhr.html", import.meta.url), "utf-8"),
};

const timeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), ms).unref(),
    ),
  ]);
};

const { client, port, close } = await server(pages);
const base = `http://127.0.0.1:${port}`;

const wait = async () => {
  return await timeout(
    new Promise<Record<string, string>>((resolve) => {
      client.once("data", (headers) => resolve(headers));
    }),
    30_000,
  );
};

const browser = setUpBrowser({ platform: process.platform });

type Target = {
  key: string;
  optional?: boolean;
  driver: () => Promise<WebDriver>;
};

const prefix = (() => {
  if (process.platform === "win32") return "";
  if (process.platform === "darwin") return "macos-";
  if (process.platform === "linux") return "linux-";
  return "";
})();

const targets: Target[] = [];
for (const headless of [false, true]) {
  const name = headless ? "headless-" : "";
  targets.push({
    key: `${prefix}${name}chrome`,
    driver: () => browser.chromeDriver({ headless, path: env.CHROME_PATH }),
  });
  targets.push({
    key: `${prefix}${name}edge`,
    driver: () => browser.edgeDriver({ headless, path: env.EDGE_PATH }),
  });
  targets.push({
    key: `${prefix}${name}firefox`,
    driver: () => browser.firefoxDriver({ headless, path: env.FIREFOX_PATH }),
  });
}
if (process.platform === "darwin") {
  targets.push({
    key: `${prefix}safari`,
    optional: true,
    driver: () => browser.safariDriver(),
  });
}

const headers: [string, Record<string, string>][] = [];
for (const target of targets) {
  console.log(`running: ${target.key}`);
  const driver = await target.driver();
  const [top] = await Promise.all([wait(), driver.get(`${base}`)]);
  const [fetched] = await Promise.all([wait(), driver.get(`${base}/fetch`)]);
  const [xhr] = await Promise.all([wait(), driver.get(`${base}/xhr`)]);
  await driver.quit();
  headers.push(
    [target.key, top],
    [`${target.key}-fetch`, fetched],
    [`${target.key}-xhr`, xhr],
  );
}

close();

await writeFile(
  "header.json",
  JSON.stringify(Object.fromEntries(headers), null, 4),
);
console.log(`collected: ${headers.length} keys`);
