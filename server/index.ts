import { Elysia, error } from "elysia";
import config from "./config";
import helper from "./helper";
import captcha from "./captcha";
import { rateLimit } from "elysia-rate-limit";
import { staticPlugin } from '@elysiajs/static'
import { cors } from '@elysiajs/cors'
import fetch from 'node-fetch';

Bun.write('tempcaptcha.db',"{}")

let netaddr = '[::1]'
netaddr = require('node:os').hostname()

const server = new Elysia();

server.use(rateLimit(config.ratelimit))
server.use(staticPlugin({assets:"static/",prefix:"/"}))
server.use(cors()) // ElysiaJS cors plugin

// general

async function ping(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (response.status >= 200 && response.status < 400) {
      return 'up';
    } else {
      return 'down';
    }
  } catch (error) {
    return 'down';
  }

}

server.get("/api/", () => {
    return "Welcome to Deblok!";
})

async function healthcheck() {
  let bak = await ping('https://bak-backend.deblok.me')
  let main = await ping('https://main-backend.deblok.me')
  return {"api":"up","backup-backend":bak,"main-backend":main};
}

server.get("/api/__healthcheck", async () => { // using /api/__healthcheck to be compatible with Kasmweb's API format
return await healthcheck()
})

server.get("/api/healthcheck", async () => { // alias
  return await healthcheck()
  })

// captcha

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
  } catch (e) {console.error(e);set.status = 400; return "ERR: Bad JSON"}
  const usr:string = bjson["usr"]
  var pwd:string = bjson["pwd"]
  const email:string = bjson["em"]
  if (usr == "" || !usr || pwd == "" || !pwd || email == "" || !email) {
    set.status = 400; return "ERR: One or more fields are missing."
  }
  if (pwd.length != 71) {set.status = 400; return "ERR: Invalid input."}
  if (usr.length != 36) {set.status = 400; return "ERR: Invalid input."}
  if (!String(pwd).startsWith('sha256:') || !String(usr).startsWith('md5:')) {
    set.status = 400; return "ERR: Invalid input."
    
  }
  try {
  var db = helper.sql.open('db.sql',true)
  var exists = helper.sql.read(db,'credentials',usr)
  if (exists) {set.status = 400; return "ERR: Username already exists"}
  // TODO: prevent email sharing
  pwd = await Bun.password.hash(pwd)
  var guid = crypto.randomUUID()
  helper.sql.write(db,'credentials',usr,`u/${usr}/p/${pwd}/e/${btoa(email)}|guid/${guid}`)
  return guid
  } catch (e) {console.error(e);set.status = 500;return e;}
  

 });

 // authentication

server.post("/api/auth/login", async ({body,set}) => {
  const b:any=body // the body variable is actually a string, this is here to fix a ts error
  var bjson:any={"usr":"","pwd":"","em":""}
  try {
    bjson=JSON.parse(b)
    } catch (e) {console.error(e);set.status = 400; return "ERR: Bad JSON"}
  const usr:string = bjson["usr"]
  var pwd:string = bjson["pwd"]
  const email:string = bjson["em"]
  if (usr == "" || !usr || pwd == "" || !pwd || email == "" || !email) {
    set.status = 400; return "ERR: One or more fields are missing."
  }
  if (pwd.length != 71) {set.status = 400; return "ERR: Invalid input."}
  if (usr.length != 36) {set.status = 400; return "ERR: Invalid input."}
  if (!String(pwd).startsWith('sha256:') || !String(usr).startsWith('md5:')) {
    set.status = 400; return "ERR: Invalid input."
  }
  var db = helper.sql.open('db.sql',true)
  var entry:any = helper.sql.read(db,'credentials',usr)
  if (entry) {
    var e:any = entry["value"] // oohhhhhh
    e = e.split('|')
    e[0] = e[0].split('/')
    let v:any = false
    try {v = Bun.password.verify(pwd,e[1]) } catch (e) {return e;}
    if (v) {
      return btoa(`@dblok.cr${Date.now().toString(20)}.ex${(Date.now() + (43200 * 1000)).toString(20)}.${btoa(`${usr.substring(6)}.${e[1].split('/')[1]}`)}`)
    } else {set.status = 400; return "ERR: Password is incorrect."}

  } else {
    set.status = 400; return "ERR: Username is incorrect."
  }

});



server.post("/api/auth/tokenvalidate", async ({body,set}) => {
  const b:any=body // the body variable is actually a string, this is here to fix a ts error
  let authtoken = b.split('.')
  let errors = false

  if (!b.startsWith('@dblok.')) {errors = true}
  if (!authtoken[1].startsWith('cr')) {errors = true}

  return !errors
});

// TODO for anyone who comes across here:
// - make endpoints for starting up N.eko containers
//   with custom ram amounts (max 3.5gb), cores (max: 2)
//   and extensions.
// - above but for removing containers
// - i will give a n.eko deployment link so yall can work
//   on it!
// - healthcheck which also checks neko rooms deployments (assigned: rare, or spark)

// left by rare1k

// startup

console.log(`Listening on port ${config.webserver.port} or`),
console.log(` │ 0.0.0.0:${config.webserver.port}`),
console.log(` │ 127.0.0.1:${config.webserver.port}`),
console.log(` │ ${netaddr}:${config.webserver.port}`),
console.log(` └─────────────────────────>`),
server.listen(config.webserver);
