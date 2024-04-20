import express from "express";
import type { Request, Response } from "express";
import config from "../config";
import rateLimit from "express-rate-limit";
const server = express();
server.use(rateLimit(config.ratelimit));
console.warn("warn: unavailable mode is enabled!");
server.use("/assets", express.static("static/assets"));

server.all("/app.css", async (req: Request, res: Response) => {
  res.statusCode = 200;
  res.sendFile(
    import.meta.dir.replace("server/modules", "") + "/static/app.css",
  );
});
server.get("/api/__healthcheck", async (req: Request, res: Response) => {
  res.json({ api: "down", backend: ["n/a"] });
});
server.get("/api/healthcheck", async (req: Request, res: Response) => {
  res.json({ api: "down", backend: ["n/a"] });
});
server.get("/*", async (req: Request, res: Response) => {
  console.log(import.meta.dir);
  res.statusCode = 503;
  res.sendFile(
    import.meta.dir.replace("server/modules", "") + "/static/503.html",
  );
});

console.log(
  `Listening in Unavailiable Mode on port ${config.webserver.port} or`,
),
  console.log(` │ 0.0.0.0:${config.webserver.port}`),
  console.log(` │ 127.0.0.1:${config.webserver.port}`),
  console.log(` └─────────────────────────>`),
  server.listen(config.webserver);
