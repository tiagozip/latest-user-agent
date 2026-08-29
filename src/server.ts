import { serve } from "@hono/node-server";
import { Hono } from "hono";

import EventEmitter from "node:events";
import type TypedEmitter from "typed-emitter";

export type ClientEvents = {
  data: (headers: Record<string, string>) => void;
};

export const server = async (pages: { fetch: string; xhr: string }) => {
  const client = new EventEmitter({
    captureRejections: true,
  }) as TypedEmitter<ClientEvents>;

  const app = new Hono();
  app.get("/favicon.ico", (c) => c.notFound());
  app.get("/fetch", (c) => c.html(pages.fetch));
  app.get("/xhr", (c) => c.html(pages.xhr));
  app.get("/", (c) => {
    client.emit("data", Object.fromEntries(c.req.raw.headers));
    return c.json({ ok: true });
  });

  let instance!: ReturnType<typeof serve>;
  const port = await new Promise<number>((resolve) => {
    instance = serve({ fetch: app.fetch, port: 0, hostname: "127.0.0.1" }, (info) =>
      resolve(info.port),
    );
  });

  return { client, port, close: () => instance.close() };
};
