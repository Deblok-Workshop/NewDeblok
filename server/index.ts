import { Elysia } from "elysia";
import config from "./config";

const server = new Elysia();

server.get("/", () => {
    return "Welcome to Deblok!";
})

server.listen(config);