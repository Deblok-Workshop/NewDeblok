import { Elysia } from "elysia";
import config from "./config";
import { rateLimit } from "elysia-rate-limit";
import { staticPlugin } from '@elysiajs/static'
import { cors } from '@elysiajs/cors'

const server = new Elysia();

server.use(rateLimit(config.ratelimit))
server.use(staticPlugin({assets:"static/",prefix:"/"}))
server.use(cors()) // ElysiaJS cors plugin

server.get("/api/", () => {
    return "Welcome to Deblok!";
})
server.get("/api/__healthcheck", () => { // using /api/__healthcheck to be compatible with Kasmweb's API format
  return {healthy:true};
})
server.listen(config.webserver);