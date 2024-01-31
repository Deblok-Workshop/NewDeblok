import { Elysia } from "elysia";
import wsconfig from "./wsconfig";
import config from "./config";
import { rateLimit } from "elysia-rate-limit";
const server = new Elysia();
server.use(rateLimit(config.ratelimit))

server.get("/", () => {
    return "Welcome to Deblok!";
})

server.listen(wsconfig);