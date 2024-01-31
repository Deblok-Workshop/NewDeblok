import { Elysia } from "elysia";
import config from "./config";
import { rateLimit } from "elysia-rate-limit";
const server = new Elysia();
server.use(rateLimit(config.ratelimit))
server.get("/", () => {
    return "Welcome to Deblok!";
})
server.listen(config.webserver);