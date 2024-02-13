import { Elysia, error } from "elysia";
import config from "./config";
import { staticPlugin } from "@elysiajs/static";
import { cors } from "@elysiajs/cors";
const server = new Elysia();

server.all("/*", async ({ set }) => {
    set.status = 503;
    return Bun.file("static/503.html");
  });
  server.all("/app.css", async ({ set }) => {
    return Bun.file("static/app.css");
  });
  server.get("/api/__healthcheck", async ({ set }) => {
    return {"api":"down","backend":[]};
  });
  server.get("/api/healthcheck", async ({ set }) => {
    return {"api":"down","backend":[]};
  });
  server.use(staticPlugin({ assets: "static/assets", prefix: "/assets" }));
  console.log(`Listening in Unavailiable Mode on port ${config.webserver.port} or`),
  console.log(` │ 0.0.0.0:${config.webserver.port}`),
  console.log(` │ 127.0.0.1:${config.webserver.port}`),
  console.log(` └─────────────────────────>`),
  server.listen(config.webserver);
