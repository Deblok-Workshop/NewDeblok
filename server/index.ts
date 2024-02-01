import { Elysia } from "elysia";
import config from "./config";
import helper from "./helper";
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
  return {};
})

server.get("/testing/dbopen", () => {
  return helper.sql.open('./db.sql',true);
})
server.get("/testing/dbwrite", () => {
  let db = helper.sql.open('./db.sql',true);
  let dbwr = helper.sql.write(db,'test','test','1234','append');
  return dbwr;
})
server.get("/testing/dbread", () => {
  let db = helper.sql.open('./db.sql',true);
  let dbrd = helper.sql.read(db,'test','test');
  return dbrd;
})
server.listen(config.webserver);