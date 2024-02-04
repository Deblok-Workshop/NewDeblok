import { Elysia } from "elysia";
import config from "./config";
import helper from "./helper";
import captcha from "./captcha";
import { rateLimit } from "elysia-rate-limit";
import { staticPlugin } from '@elysiajs/static'
import { cors } from '@elysiajs/cors'

Bun.write('tempcaptcha.db',"{}")

let netaddr = '[::1]'
netaddr = require('node:os').hostname()

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
server.get("/api/captcha/:query/image.gif", async ({ params: { query },set }) => {
  
  var tempdbfile:Blob = Bun.file('tempcaptcha.db')
  var tempdb = JSON.parse(await tempdbfile.text())
  if (tempdb[query] != undefined) {
   var buf = await captcha.mathfuck.img(tempdb[query])
   return new Blob([buf])
  } else {
    set.status = 404
    return "CAPTCHA not found"
  }
});
server.get("/api/captcha/request", async () => {
  var tempdbfile:Blob = Bun.file('tempcaptcha.db')
  var tempdb = JSON.parse(await tempdbfile.text())
  var randuuid = crypto.randomUUID();
  tempdb[randuuid] = captcha.mathfuck.random()
  Bun.write('./tempcaptcha.db',JSON.stringify(tempdb))
  return randuuid
 });
console.log(`Listening on port ${config.webserver.port} or`)
console.log(` │ 0.0.0.0:${config.webserver.port}`)
console.log(` │ 127.0.0.1:${config.webserver.port}`)
console.log(` │ ${netaddr}:${config.webserver.port}`)
console.log(` └─────────────────────────>`)
server.listen(config.webserver);