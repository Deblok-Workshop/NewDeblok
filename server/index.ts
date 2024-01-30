import { Elysia } from "elysia";
import config from "./config";
import { rateLimit } from "elysia-rate-limit";
const server = new Elysia();
server.use(rateLimit({duration: 300000, max:100, responseMessage:"Global rate limit reached"}))

server.get("/", () => {
    return "Welcome to Deblok!";
})

server.listen(config);