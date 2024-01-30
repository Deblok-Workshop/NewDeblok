import { Elysia } from "elysia";
import config from "./config";

const server = new Elysia();

server.get("/", () => {
    return "Hello!";
})

server.listen(config);