import express from 'express';
import type { Request, Response } from 'express';
import config from "./config";
import helper from "./modules/helper";
import captcha from "./modules/captcha";
// import { rateLimit } from "express-rate-limit";
import cors from "cors";
import fetch from "node-fetch";
import wordlistsafe from "./modules/wordlistsafe";
import util from "./modules/util.ts"
let endpoints: any = process.env.ENDPOINTS;
endpoints = endpoints.split(",");
let netaddr = "[::1]";
netaddr = require("node:os").hostname();
const server = express();
var HTTPproxy = require('http-proxy');
const WSocket = require('ws');
var bodyParser = require('body-parser');
server.use(bodyParser.raw({type:"text/plain"}));

// errors
/*// idk if theres an express-quivulent to this, i dont care atm.
server.onError(({ code, error, set }) => {
  if (code === "NOT_FOUND") {
    res.statusCode = 404;

    return Bun.file("static/404.html");
  }
  if (code === "INTERNAL_SERVER_ERROR") {
    res.statusCode = 500;

    return Bun.file("static/500.html");
  }
});*/

// Run the startup "job"
require("./modules/startupjob.ts");
server.use("/", express.static("static/"));
server.use(cors()); // Express cors plugin
// server.use(rateLimit(config.ratelimit));
if (process.argv.includes("--unavailable") || process.argv.includes("-u")) {
  require("./modules/unavailable.ts");
} else {
  // server.use(staticPlugin({ assets: "static/", prefix: "/" }));


  let dbpwd: any = process.env.DBPWD;
  dbpwd = new Bun.CryptoHasher("sha256").update(dbpwd).digest("hex");

  // general

  server.get("/favicon.ico", async (req: Request, res: Response) => {
    // fallback
    res.redirect("/assets/favicon.png");
  });

  
  server.get("/api/", (req: Request, res: Response) => {
    res.send("Welcome to Deblok!");
  });



  server.get("/api/__healthcheck", async (req: Request, res: Response) => {
    // using /api/__healthcheck to be compatible with Kasmweb's API format
    res.send(await util.healthcheck());
  });

  server.get("/api/healthcheck", async (req: Request, res: Response) => {
    // alias
    res.send(await util.healthcheck());
  });

  // captcha

  server.get(
    "/api/captcha/:query/image.gif",
    async (req: Request, res: Response) => {
      var tempdbfile: Blob = Bun.file("tempcaptcha.db");
      var tempdb = JSON.parse(await tempdbfile.text());
      if (tempdb[req.params.query] != undefined) {
        var buf = await captcha.mathfuck.img(tempdb[req.params.query]);
        res.contentType("png")
        res.send(buf);
      } else {
        res.statusCode = 404;
        res.send("ERR: CAPTCHA not found");return;
      }
    },
  );
  server.post(
    "/api/captcha/:query/validate",
    async (req: Request, res: Response) => {
      var b: any = req.body;
      var rv = false;
      var tempdbfile: Blob = Bun.file("tempcaptcha.db");
      var tempdb = JSON.parse(await tempdbfile.text());
      if (tempdb[req.params.query] != undefined) {
        let result:number = Number(captcha.mathfuck.eval(tempdb[req.params.query]))
        console.log(b,Number(b),Number(result))
        if (Number(b) != Number(result)) {
          
          rv = false;
        } else {
          rv = true;
        }
        tempdb[req.params.query] = undefined;
        Bun.write("./tempcaptcha.db", JSON.stringify(tempdb));
        res.send(rv);
      } else {
        res.statusCode = 404;
        res.send("ERR: CAPTCHA not found");return;
      }
    },
  );
  server.get("/api/captcha/:query/void", async (req: Request, res: Response) => {
    var tempdbfile: Blob = Bun.file("tempcaptcha.db");
    var tempdb = JSON.parse(await tempdbfile.text());
    if (tempdb[req.params.query] != undefined) {
      tempdb[req.params.query] = undefined;
      Bun.write("./tempcaptcha.db", JSON.stringify(tempdb));
      res.statusCode = 204;
      res.send("");
    } else {
      res.statusCode = 404;
      res.send("ERR: CAPTCHA not found");return;
    }
  });
  server.get("/api/captcha/request", async (req: Request, res: Response) => {
    var tempdbfile: Blob = Bun.file("tempcaptcha.db");
    var tempdb = JSON.parse(await tempdbfile.text());
    var randuuid = crypto.randomUUID();
    tempdb[randuuid] = captcha.mathfuck.random();
    //console.log(tempdb[randuuid]) //debug
    Bun.write("./tempcaptcha.db", JSON.stringify(tempdb));
    res.send(randuuid);
  });
  server.post("/api/auth/signup", async (req: Request, res: Response) => {
    const b: any = req.body; // the body variable is actually a string, this is here to fix a ts error
    let bjson: any = { usr: "", pwd: "", em: "" };
    try {
      bjson = JSON.parse(b);
    } catch (e) {
      console.error(e);
      res.statusCode = 400;
      res.send("ERR: Bad JSON");return;
    }
    const usr: string = bjson["usr"];
    var pwd: string = bjson["pwd"];
    const email: string = bjson["em"];
    if (usr == "" || !usr || pwd == "" || !pwd || email == "" || !email) {
      res.statusCode = 400;
      res.send("ERR: One or more fields are missing.");return;
    }
    if (pwd.length != 71) {
      res.statusCode = 400;
      res.send("ERR: Invalid input, pwd should be a hash.");return;
    }
    if (usr.length != 36) {
      res.statusCode = 400;
      res.send("ERR: Invalid input, usr should be a hash.");return;
    }
    if (!String(pwd).startsWith("sha256:") || !String(usr).startsWith("md5:")) {
      res.statusCode = 400;
      res.send("ERR: Invalid input, the hash should be known.");return;
    }
    try {
      var db = helper.sql.open("db.sql", true);
      var exists = helper.sql.read(db, "credentials", usr);
      if (exists) {
        res.statusCode = 400;
        res.send("ERR: Username already exists");return;
      }
      // TODO: prevent email sharing
      try {
        console.log(pwd)
        pwd = await Bun.password.hash(pwd,{
          algorithm: "argon2id", // "argon2id" | "argon2i" | "argon2d"
          memoryCost: 4096, // memory usage in kibibytes
          timeCost: 15, // the number of iterations
        });
        console.log(pwd)
      } catch (e) {
        console.error(e)
        res.statusCode = 500;
        res.send(e);
      }
      var guid = crypto.randomUUID();
      helper.sql.write(
        db,
        "credentials",
        usr,
        `u/${usr}/p/${pwd.replaceAll("/","??")}/e/${btoa(email)}|guid/${guid}`,
      );
      helper.sql.write(
        db,
        "userinfo",
        usr,
        btoa(JSON.stringify({"displayName":usr.split(":")[1].substring(0,16)})) // don't know real username
      )
      res.send(guid);
    } catch (e) {
      console.error(e);
      res.statusCode = 500;
      res.send(e);
    }
  });

  // authentication

  server.post("/api/auth/login", async (req: Request, res: Response) => {
    const b: any = req.body; // the body variable is actually a string, this is here to fix a ts error
    var bjson: any = { usr: "", pwd: "", em: "" };
    try {
      bjson = JSON.parse(b);
    } catch (e) {
      console.error(e);
      res.statusCode = 400;
      res.send("ERR: Bad JSON");return;
    }
    const usr: string = bjson["usr"];
    var pwd: string = bjson["pwd"];
    if (usr == "" || !usr || pwd == "" || !pwd) {
      res.statusCode = 400;
      res.send("ERR: One or more fields are missing.");return;
    }
    if (pwd.length != 71) {
      res.statusCode = 400;
      res.send("ERR: Invalid input.");return;
    }
    if (usr.length != 36) {
      res.statusCode = 400;
      res.send("ERR: Invalid input.");return;
    }
    if (!String(pwd).startsWith("sha256:") || !String(usr).startsWith("md5:")) {
      res.statusCode = 400;
      res.send("ERR: Invalid input.");return;
    }
    var db = helper.sql.open("db.sql", true);
    var entry: any = helper.sql.read(db, "credentials", usr);
    if (entry) {
      var e: any = entry["value"]; // oohhhhhh
      e = e.split("|");
      e[0] = e[0].split("/");
      let v: any = false;
      try {
        
        v = await Bun.password.verify(pwd, e[0][3].replaceAll("??","/"));
      } catch (e) {
        res.statusCode = 500;
        console.error(e);
        res.send(e);
      }
      if (v) {
        res.send(btoa(
          `@dblok.cr${Date.now().toString(20)}.ex${(Date.now() + 43200 * 1000).toString(20)}.${btoa(`${usr.substring(6)}.${e[1].split("/")[1]}`)}`,
        ));
      } else {
        res.statusCode = 400;
        res.send("ERR: Password is incorrect.");return;
      }
    } else {
      res.statusCode = 400;
      res.send("ERR: Username is incorrect.");return;
    }
  });
  server.post("/api/auth/tokenvalidate", async (req: Request, res: Response) => {
    try {
    let out = helper.auth.validate(atob(req.body));
    if (out[0]) {
      res.statusCode = 400;
      res.send(`ERR: ${out[1]}`);return;
    } else {
      res.send("OK");
    } } catch {res.statusCode = 400;res.end()}
  });

  server.post("/api/auth/pwdsafe", async (req: Request, res: Response) => {
    res.send( !wordlistsafe.isSafe(req.body));
  });
  // container management

  server.post("/api/container/create", async (req: Request, res: Response) => {
    try {
    const b: any = req.body; // the body variable is actually a string, this is here to fix a ts error
    var bjson: any = {
      name: "",
      for: ""
    }; // boilerplate to not piss off TypeScript.
    bjson = JSON.parse(b);
    if (!bjson.name || bjson.name == "" || !bjson.for || bjson.for == "") {
      res.statusCode = 400;
      res.send("ERR: Name and for field is required.");return;
    }
    let db = helper.sql.open("db.sql")
    let dbEntry:any = helper.sql.read(db, "userinfo", bjson.for);
    if (!dbEntry["value"]) {
      res.statusCode = 400;
      res.send("ERR: Must provide userid.");return;
    }
    let back: any = await util.getBacks();
    console.log(back)
    if (!back) {
      throw new Error("No online DeblokManager backends found!");
    }
    let dockconff = Bun.file("docker/containers.json");
    let dconf = await dockconff.json();
    if (dconf[bjson.name.toLowerCase()] == undefined) {
      res.statusCode = 404;
      res.send("Image could not be found in configuration.");
    }
    let selling: any = dconf[bjson.name.toLowerCase()];
    let ports: any = await util.getBackPorts(await util.getBacks());
    if (selling.port) {
      
      selling.ports = `${ports[0]}:${selling.port}`;
    }
    selling.name = `newdeblok-${bjson.name}-${ports[0]}`
    let fr = await fetch(`http://${back}/containers/create`, {
      method: "POST",
      body: JSON.stringify(selling),
      headers: {"Authorization":util.getHTTPAuthHeader(back),"Content-Type":"text/plain"}
    });
    let resp = await fr.text()
    let sessionsDBentry:any = helper.sql.read(db, "sessions", bjson.for);
    let sessionsEnrtyVal = JSON.parse(atob(sessionsDBentry["value"])) || JSON.parse("{}") // assume no sessions if it doesnt exist
    sessionsEnrtyVal[resp]={"id":resp,"status":"created"}
    helper.sql.write(
      db,
      "sessions",
      bjson.for,
      btoa(JSON.stringify(sessionsEnrtyVal))
    );
    res.send(
      {
      "port":selling.ports,
      "returned":resp
    });
  } catch (e) {
    res.statusCode = 503;
    res.send(e);
  }
  });

  server.post("/api/container/kill", async (req: Request, res: Response) => {
    const b: any = req.body; // the body variable is actually a string, this is here to fix a ts error
    var bjson: any = { id: "", for: "" }; // boilerplate to not piss off TypeScript.
    bjson = JSON.parse(b)
    if (!bjson.id || bjson.id == "" || !bjson.for || bjson.for == "") {
      res.statusCode = 400;
      res.send("ERR: The ID and for field is required.");return;
    };
    let db = helper.sql.open("db.sql")
    let dbEntry:any = helper.sql.read(db, "userinfo", bjson.for);
    if (!dbEntry["value"]) {
      res.statusCode = 400;
      res.send("ERR: Must provide userid or it is invalid.");return;
    }
    let back: any = await util.getBacks();
    if (!back) {
      throw new Error("No online DeblokManager backends found!");
    }
   
    let fr = await fetch(`http://${back}/containers/kill`, {
      method: "POST",
      body: JSON.stringify(req.body),
      headers: {"Authorization":util.getHTTPAuthHeader(back),"Content-Type":"text/plain"}
    });
    let resp = await fr.text()
    let sessionsDBentry:any = helper.sql.read(db, "sessions", bjson.for);
    let sessionsEnrtyVal = JSON.parse(atob(sessionsDBentry["value"])) || JSON.parse("{}") // assume no sessions if it doesnt exist
    sessionsEnrtyVal[resp]={"id":resp,"status":"killed"}
    helper.sql.write(
      db,
      "sessions",
      bjson.for,
      btoa(JSON.stringify(sessionsEnrtyVal))
    );
    res.send(resp);
  });
  server.get("/api/container/getsessions/:user", async (req: Request, res: Response) => {
    const b: any = req.params.user; 
    if (!b || b == "") {
      res.statusCode = 400;
      res.send("ERR: The user field is required.");return;return;
    };
  let db = helper.sql.open("db.sql");
  let sessionsDBentry:any = helper.sql.read(db, "sessions", "md5:"+b);
  res.json(JSON.parse(sessionsDBentry["value"] || "{}"))
  });
  server.get("/api/auth/getuserinfo/:user/", async (req: Request, res: Response) => {
    const b: any = req.params.user; 
    if (!b || b == "") {
      res.statusCode = 400;
      res.send("ERR: The user field is required.");return;return;
    };
  let db = helper.sql.open("db.sql");
  let sessionsDBentry:any = helper.sql.read(db, "userinfo", "md5:"+b);
  res.json(JSON.parse(atob(sessionsDBentry["value"]|| btoa("{}"))))
  });
  server.post("/api/auth/updatedisplayname/", async (req: Request, res: Response) => {
    const b: any = req.body; // the body variable is actually a string, this is here to fix a ts error
    var bjson: any = { newname: "", for: "", auth: "" }; // boilerplate to not piss off TypeScript.
    bjson = JSON.parse(b)
    if (!bjson.newname || bjson.newname == "" || !bjson.for || bjson.for == "" || !bjson.auth || bjson.auth == "") {
      res.statusCode = 400;
      res.send("ERR: All fields are required");return;
    };
    if (!helper.auth.validate(bjson.auth)[0]) {
      res.statusCode = 400;
      res.send("ERR: Auth token is errornous.");return;
    }
    let db = helper.sql.open("db.sql")
    let dbEntry:any = helper.sql.read(db, "userinfo", "md5:"+bjson.for);
    if (!dbEntry["value"]) {
      res.statusCode = 400;
      res.send("ERR: Must provide userid or it is invalid.");return;
    }
  let sessionsDBentry:any = helper.sql.read(db, "userinfo", "md5:"+bjson.for);
  let uinfo = JSON.parse(atob(sessionsDBentry["value"]|| btoa("{}")))
  uinfo.displayName = bjson.newname;
  helper.sql.write(
    db,
    "userinfo",
    "md5:"+bjson.for,
    btoa(JSON.stringify(uinfo)) // don't know real username
  )
  res.send("OK!");
  return;
  });
  server.post("/api/container/delete", async (req: Request, res: Response) => {
    const b: any = req.body; // the body variable is actually a string, this is here to fix a ts error
    var bjson: any = { id: "", for: "" }; // boilerplate to not piss off TypeScript.
    bjson = JSON.parse(b)
    if (!bjson.id || bjson.id == "" || !bjson.for || bjson.for == "") {
      res.statusCode = 400;
      res.send("ERR: The ID and for field is required.");return;
    };
    let db = helper.sql.open("db.sql")
    let dbEntry:any = helper.sql.read(db, "userinfo", bjson.for);
    if (!dbEntry["value"]) {
      res.statusCode = 400;
      res.send("ERR: Must provide userid or it is invalid.");return;
    }
    let back: any = await util.getBacks();
    if (!back) {
      throw new Error("No online DeblokManager backends found!");
    }
    if (!bjson.id || bjson.id == "") {
      res.statusCode = 400;
      res.send("ERR: The ID field is required.");return;
    }
    let fr = await fetch(`http://${back}/containers/delete`, {
      method: "POST",
      body: JSON.stringify(req.body),
      headers: {"Authorization":util.getHTTPAuthHeader(back),"Content-Type":"text/plain"}
    });
    let resp = await fr.text()
    let sessionsDBentry:any = helper.sql.read(db, "sessions", bjson.for);
    let sessionsEntryVal = JSON.parse(atob(sessionsDBentry["value"])) || JSON.parse("{}") // assume no sessions if it doesnt exist
    sessionsEntryVal[resp] = undefined
    helper.sql.write(
      db,
      "sessions",
      bjson.for,
      btoa(JSON.stringify(sessionsEntryVal))
    );
    res.send(resp);
  });
  server.post("/api/container/pause", async (req: Request, res: Response) => {
    const b: any = req.body; // the body variable is actually a string, this is here to fix a ts error
    var bjson: any = { id: "", for: "" }; // boilerplate to not piss off TypeScript.
    bjson = JSON.parse(b)
    if (!bjson.id || bjson.id == "" || !bjson.for || bjson.for == "") {
      res.statusCode = 400;
      res.send("ERR: The ID and for field is required.");return;
    };
    let db = helper.sql.open("db.sql")
    let dbEntry:any = helper.sql.read(db, "userinfo", bjson.for);
    if (!dbEntry["value"]) {
      res.statusCode = 400;
      res.send("ERR: Must provide userid or it is invalid.");return;
    }
    let back: any = await util.getBacks();
    if (!back) {
      throw new Error("No online DeblokManager backends found!");
    }
    if (!bjson.id || bjson.id == "") {
      res.statusCode = 400;
      res.send("ERR: The ID field is required.");return;
    }
    let fr = await fetch(`http://${back}/containers/pause`, {
      method: "POST",
      body: JSON.stringify(req.body),
      headers: {"Authorization":util.getHTTPAuthHeader(back),"Content-Type":"text/plain"}
    });
    let resp = await fr.text()
    let sessionsDBentry:any = helper.sql.read(db, "sessions", bjson.for);
    let sessionsEnrtyVal = JSON.parse(atob(sessionsDBentry["value"])) || JSON.parse("{}") // assume no sessions if it doesnt exist
    sessionsEnrtyVal[resp]={"id":resp,"status":"paused"}
    helper.sql.write(
      db,
      "sessions",
      bjson.for,
      btoa(JSON.stringify(sessionsEnrtyVal))
    );
    
    res.send(resp);
  });
  server.post("/api/container/unpause", async (req: Request, res: Response) => {
    const b: any = req.body; // the body variable is actually a string, this is here to fix a ts error
    var bjson: any = { id: "", for: "" }; // boilerplate to not piss off TypeScript.
    bjson = JSON.parse(b)
    if (!bjson.id || bjson.id == "" || !bjson.for || bjson.for == "") {
      res.statusCode = 400;
      res.send("ERR: The ID and for field is required.");return;
    };
    let db = helper.sql.open("db.sql")
    let dbEntry:any = helper.sql.read(db, "userinfo", bjson.for);
    if (!dbEntry["value"]) {
      res.statusCode = 400;
      res.send("ERR: Must provide userid or it is invalid.");return;
    }
    let back: any = await util.getBacks();
    if (!back) {
      throw new Error("No online DeblokManager backends found!");
    }
    if (!bjson.id || bjson.id == "") {
      res.statusCode = 400;
      res.send("ERR: The ID field is required.");return;
    }
    let fr = await fetch(`http://${back}/containers/unpause`, {
      method: "POST",
      body: JSON.stringify(req.body),
      headers: {"Authorization":util.getHTTPAuthHeader(back),"Content-Type":"text/plain"}
    });
    let resp = await fr.text()
    let sessionsDBentry:any = helper.sql.read(db, "sessions", bjson.for);
    let sessionsEnrtyVal = JSON.parse(atob(sessionsDBentry["value"])) || JSON.parse("{}") // assume no sessions if it doesnt exist
    sessionsEnrtyVal[resp]={"id":resp,"status":"started"}
    helper.sql.write(
      db,
      "sessions",
      bjson.for,
      btoa(JSON.stringify(sessionsEnrtyVal))
    );
    res.send(resp);
  });
  server.post("/api/container/keepalive", async (req: Request, res: Response) => {
    const b: any = req.body; // the body variable is actually a string, this is here to fix a ts error
    var bjson: any = { id: "" }; // boilerplate to not piss off TypeScript.
    bjson = JSON.parse(b)
    let back: any = await util.getBacks();
    if (!back) {
      throw new Error("No online DeblokManager backends found!");
    }
    if (!bjson.id || bjson.id == "") {
      res.statusCode = 400;
      res.send("ERR: The ID field is required.");return;
    }
    let fr = await fetch(`http://${back}/containers/keepalive`, {
      method: "POST",
      body: JSON.stringify(req.body),
      headers: {"Authorization":util.getHTTPAuthHeader(back),"Content-Type":"text/plain"}
    });
    let resp = await fr.text()
    res.send(resp);
  });
  server.get("/api/img/identicon.png", async (req: Request, res: Response) => {
    res.send(await helper.auth.identicon());
  });
  
  
  // proxy
  var proxy = HTTPproxy.createProxyServer({ ws: true });
  server.get('/ws/:node/*', function(req:Request, res:Response) {
    let url = req.url.replace(`/ws/${req.params.node}/`,"")
    req.url = url
    try {
    proxy.web(req, res, { target: "http://"+endpoints[req.params.node].split("@")[1]});
    } catch {}
  });

  const proxyServer = require('http').createServer(server)
  // real deal ws proxy
  const wss = new WSocket.Server({ server: proxyServer });
  wss.on('connection', function connection(ws:any, req:any) {
    
    const target = 'ws://'+endpoints[req.url.split("/")[2]].split("@")[1]+"/"+req.url.replace(`/ws/${req.url.split("/")[2]}/`,""); 
    // @ts-ignore
    const wsProxy = new WebSocket(target);
    // @ts-ignore
    wsProxy.addEventListener("message", event => {ws.send(event.data);});
    // @ts-ignore
    wsProxy.addEventListener("close", event => {ws.close()});
    // @ts-ignore
    ws.addEventListener("message", event => {wsProxy.send(event.data);});
    // @ts-ignore
    ws.addEventListener("close", event => {wsProxy.close()});
    
});

  // proxy upgrade req
  proxyServer.on('upgrade', function (req:any, socket:any, head:any) {
    if (req.url.split("/")[1] == "ws") {  
    let url = "http://"+endpoints[req.url.split("/")[2]].split("@")[1]+"/"+req.url.replace(`/ws/${req.url.split("/")[2]}/`,"")
    req.url = url
    proxy.ws(req, socket, head,{target: req.url})
    } else {socket.send("no")}
  })
  // startup
  if (
    !process.argv.includes("--unavailiable") &&
    !process.argv.includes("-u")
  ) {
    console.log(`Listening on port ${config.webserver.port} or`),
      console.log(` │ 0.0.0.0:${config.webserver.port}`),
      console.log(` │ 127.0.0.1:${config.webserver.port}`),
      console.log(` │ ${netaddr}:${config.webserver.port}`),
      console.log(` └─────────────────────────>`),
      config.webserver.ws = true,
      proxyServer.listen(config.webserver);
  }
}
