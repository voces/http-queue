import { Client } from "./deps.ts";

const rawPort = Deno.env.get("HTTP_QUEUE_DB_PORT");
const port = typeof rawPort === "string" ? parseInt(rawPort) : 3306;

const client = await new Client().connect({
  hostname: "localhost",
  username: "http_queue_consumer",
  port,
  db: "w3xio",
  poolSize: 3,
  password: Deno.env.get("HTTP_QUEUE_DB_PASS"),
});

const TRUE = 1;
const FALSE = 0;

type RawReq = {
  id: number;
  key: string;
  method: string;
  url: string;
  headers: string | null;
  body: string | null;
  // deno-lint-ignore camelcase
  require_ok: typeof TRUE | typeof FALSE;
  retries: number;
  next: Date;
};

let noWorkCounter = 60;

const log = (...args: unknown[]) =>
  console.log(new Date().toISOString(), ...args);

export const work = async () => {
  const result = await client.transaction(async (conn) => {
    const reqs = await conn.query(
      `SELECT *
FROM w3xio.http_queue
WHERE next < CURRENT_TIMESTAMP
ORDER BY next ASC
LIMIT 1;`
    );
    if (!Array.isArray(reqs) || reqs.length === 0) return;
    const req = reqs[0] as RawReq;

    log(
      req.id,
      "found job",
      new URL(req.url).origin,
      "with",
      req.retries,
      req.retries === 1 ? "retry" : "retries",
      "remaining"
    );

    if (req.retries > 0) {
      await conn.query(
        `UPDATE w3xio.http_queue SET retries = ${
          req.retries - 1
        }, next = FROM_UNIXTIME(${Date.now() / 1000 + 180}) WHERE id = ${
          req.id
        };`
      );
    } else {
      await conn.query(`DELETE FROM w3xio.http_queue WHERE id = ${req.id};`);
    }
    return req;
  });

  if (!result) {
    if (--noWorkCounter === 0) {
      noWorkCounter = 60;
      log("no work");
    }
    return;
  }

  log(result.id, "fetching");

  const req = fetch(result.url, {
    method: result.method,
    headers: result.headers ? JSON.parse(result.headers) : undefined,
    body: result.body ? JSON.parse(result.body) : undefined,
  });

  if (result.require_ok === TRUE) {
    const res = await req;
    if (!res.ok) {
      log(result.id, "not ok");
      return;
    } else {
      log(result.id, "ok");
    }
  } else {
    log(result.id, "skipping ok");
  }

  await client.query(`DELETE FROM w3xio.http_queue WHERE id = ${result.id};`);
};
