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
    return "ERR: CAPTCHA not found"
  }
});
server.post("/api/captcha/:query/validate", async ({body ,params: { query },set }) => {
  var b:any = body
  var rv = false
  var tempdbfile:Blob = Bun.file('tempcaptcha.db')
  var tempdb = JSON.parse(await tempdbfile.text())
  if (tempdb[query] != undefined) {
    if (b != captcha.mathfuck.eval(tempdb[query])) {
      rv = false
    } else {
      rv = true
    }
    tempdb[query] = undefined
    Bun.write('./tempcaptcha.db',JSON.stringify(tempdb))
    return rv
  } else {
    set.status = 404
    return "ERR: CAPTCHA not found"
  }
}); 
server.get("/api/captcha/:query/void", async ({params: { query },set }) => {
  var tempdbfile:Blob = Bun.file('tempcaptcha.db')
  var tempdb = JSON.parse(await tempdbfile.text())
  if (tempdb[query] != undefined) {
    tempdb[query] = undefined
    set.status = 204
    return "";
  } else {
    set.status = 404
    return "ERR: CAPTCHA not found"
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
server.post("/api/auth/signup", async ({body,set}) => {
  const b:any=body // the body variable is actually a string, this is here to fix a ts error
  let bjson:any = {"usr":"","pwd":"","em":""}
  try {
  bjson=JSON.parse(b)
  } catch {set.status = 400; return "ERR: Bad JSON"}

  const usr:string = bjson["usr"]
  const pwd:string = bjson["pwd"]
  const email:string = bjson["em"]
  if (usr == "" || !usr || pwd == "" || !pwd || email == "" || !email) {
    set.status = 400; return "ERR: One or more fields are missing."
  }

// TODO:
// Read the body JSON (which is the bjson variable), then
// Accept a sha256 hash (must start with "sha256:") for the password
// then securely hash that using Bun.password.hash for secure double
// hashing. Once it is hashed, add the entry to the hcreds table in
// the SQL database. The username will be MD5 hashed in the db and
// will be used as a user ID. The entry name will be the uid, and
// the entry value will be the double hashed password.

// Use helper.sql.open('db.sql') to open the database
// Use helper.sql.read(db, 'tablename','name') to read
// Use helper.sql.write(db,'tablename','name','value') to write
// Use helper.crypto.aes.encrypt(mode,'text','key') to AES encrypt
// Use helper.crypto.aes.decrypt(mode,'text','key') to AES decrypt

// Do something similar for the login endpoint. 
// I don't feel like writing a whole another paragraph rn bc 
// im on mobile and i need to fix ssh 😞
 });

server.post("/api/auth/login", async ({body,set}) => {
  const b:any=body // the body variable is actually a string, this is here to fix a ts error
  const bjson:Object=JSON.parse(b)
// Please see the TODO message above to see what to do.
// The login endpoint will be similar. Please read Bun docs to
// find out what the argon hash validation function is because
// I don't know it off of the top of my head.

});
console.log(`Listening on port ${config.webserver.port} or`),
console.log(` │ 0.0.0.0:${config.webserver.port}`),
console.log(` │ 127.0.0.1:${config.webserver.port}`),
console.log(` │ ${netaddr}:${config.webserver.port}`),
console.log(` └─────────────────────────>`),
server.listen(config.webserver);

