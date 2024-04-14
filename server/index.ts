import express from 'express';
import type { Request, Response } from 'express';
import config from "./config";
import helper from "./modules/helper";
import captcha from "./modules/captcha";
import { rateLimit } from "express-rate-limit";
import cors from "cors";
import fetch from "node-fetch";
import wordlistsafe from "./modules/wordlistsafe";
import util from "./modules/util.ts"
let endpoints: any = process.env.ENDPOINTS;
endpoints = endpoints.split(",");
let netaddr = "[::1]";
netaddr = require("node:os").hostname();
const server = express();

// errors
/*
server.onError(({ code, error, set }) => {
  if (code === "NOT_FOUND") {
    req.statusCode = 404;

    return Bun.file("static/404.html");
  }
  if (code === "INTERNAL_SERVER_ERROR") {
    req.statusCode = 500;

    return Bun.file("static/500.html");
  }
});*/

// Run the startup "job"
require("./modules/startupjob.ts");

server.use(cors()); // Express cors plugin
server.use(rateLimit(config.ratelimit));
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
        res.send("ERR: CAPTCHA not found");
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
        if (Number(b) != Number(captcha.mathfuck.eval(tempdb[req.params.query]))) {
          rv = false;
        } else {
          rv = true;
        }
        tempdb[req.params.query] = undefined;
        Bun.write("./tempcaptcha.db", JSON.stringify(tempdb));
        res.send(rv);
      } else {
        req.statusCode = 404;
        res.send("ERR: CAPTCHA not found");
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
      res.send("ERR: CAPTCHA not found");
    }
  });
  server.get("/api/captcha/request", async (req: Request, res: Response) => {
    var tempdbfile: Blob = Bun.file("tempcaptcha.db");
    var tempdb = JSON.parse(await tempdbfile.text());
    var randuuid = crypto.randomUUID();
    tempdb[randuuid] = captcha.mathfuck.random();
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
      req.statusCode = 400;
      res.send("ERR: Bad JSON");
    }
    const usr: string = bjson["usr"];
    var pwd: string = bjson["pwd"];
    const email: string = bjson["em"];
    if (usr == "" || !usr || pwd == "" || !pwd || email == "" || !email) {
      req.statusCode = 400;
      res.send("ERR: One or more fields are missing.");
    }
    if (pwd.length != 71) {
      req.statusCode = 400;
      res.send("ERR: Invalid input, pwd should be a hash.");
    }
    if (usr.length != 36) {
      req.statusCode = 400;
      res.send("ERR: Invalid input, usr should be a hash.");
    }
    if (!String(pwd).startsWith("sha256:") || !String(usr).startsWith("md5:")) {
      req.statusCode = 400;
      res.send("ERR: Invalid input, the hash should be known.");
    }
    try {
      var db = helper.sql.open("db.sql", true);
      var exists = helper.sql.read(db, "credentials", usr);
      if (exists) {
        req.statusCode = 400;
        res.send("ERR: Username already exists");
      }
      // TODO: prevent email sharing
      try {
        pwd = await Bun.password.hash(pwd);
      } catch (e) {
        res.statusCode = 500;
        res.send(e);
      }
      var guid = crypto.randomUUID();
      helper.sql.write(
        db,
        "credentials",
        usr,
        `u/${usr}/p/${pwd}/e/${btoa(email)}|guid/${guid}`,
      );
      res.send(guid);
    } catch (e) {
      console.error(e);
      req.statusCode = 500;
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
      req.statusCode = 400;
      res.send("ERR: Bad JSON");
    }
    const usr: string = bjson["usr"];
    var pwd: string = bjson["pwd"];
    if (usr == "" || !usr || pwd == "" || !pwd) {
      req.statusCode = 400;
      res.send("ERR: One or more fields are missing.");
    }
    if (pwd.length != 71) {
      req.statusCode = 400;
      res.send("ERR: Invalid input.");
    }
    if (usr.length != 36) {
      req.statusCode = 400;
      res.send("ERR: Invalid input.");
    }
    if (!String(pwd).startsWith("sha256:") || !String(usr).startsWith("md5:")) {
      req.statusCode = 400;
      res.send("ERR: Invalid input.");
    }
    var db = helper.sql.open("db.sql", true);
    var entry: any = helper.sql.read(db, "credentials", usr);
    if (entry) {
      var e: any = entry["value"]; // oohhhhhh
      e = e.split("|");
      e[0] = e[0].split("/");
      let v: any = false;
      try {
        v = await Bun.password.verify(pwd, e[0][3]);
      } catch (e) {
        req.statusCode = 500;
        console.error(e);
        res.send(e);
      }
      if (v) {
        res.send(btoa(
          `@dblok.cr${Date.now().toString(20)}.ex${(Date.now() + 43200 * 1000).toString(20)}.${btoa(`${usr.substring(6)}.${e[1].split("/")[1]}`)}`,
        ));
      } else {
        req.statusCode = 400;
        res.send("ERR: Password is incorrect.");
      }
    } else {
      req.statusCode = 400;
      res.send("ERR: Username is incorrect.");
    }
  });
  server.post("/api/auth/tokenvalidate", async (req: Request, res: Response) => {
    let out = helper.auth.validate(atob(body));
    if (out[0]) {
      req.statusCode = 400;
      return `ERR: ${out[1]}`;
    } else {
      return "OK";
    }
  });

  server.post("/api/auth/pwdsafe", async (req: Request, res: Response) => {
    return !wordlistsafe.isSafe(req.body);
  });
  // container management

  server.post("/api/container/create", async (req: Request, res: Response) => {
    const b: any = req.body; // the body variable is actually a string, this is here to fix a ts error
    var bjson: any = {
      name: "",
    }; // boilerplate to not piss off TypeScript.
    bjson = JSON.parse(b);
    if (!bjson.name || bjson.name == "") {
      req.statusCode = 400;
      res.send("ERR: Name field is required.");
    }
    let back: any = await util.getBacks();
    console.log(back)
    if (!back) {
      throw new Error("No online DeblokManager backends found!");
    }
    let dockconff = Bun.file("docker/containers.json");
    let dconf = await dockconff.json();
    if (dconf[bjson.name.toLowerCase()] == undefined) {
      req.statusCode = 404;
      return "Image could not be found in configuration.";
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
    let res = await fr.text()
    return res;
  });

  server.post("/api/container/kill", async (req: Request, res: Response) => {
    const b: any = body; // the body variable is actually a string, this is here to fix a ts error
    var bjson: any = { id: "" }; // boilerplate to not piss off TypeScript.
    let back: any = await util.getBacks();
    if (!back) {
      throw new Error("No online DeblokManager backends found!");
    }
    bjson = JSON.parse(b)
    if (!bjson.id || bjson.id == "") {
      req.statusCode = 400;
      res.send("ERR: The ID field is required.";
    }
    let fr = await fetch(`http://${back}/containers/kill`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {"Authorization":util.getHTTPAuthHeader(back),"Content-Type":"text/plain"}
    });
    let res = await fr.text()
    return res;
  });

  server.post("/api/container/delete", async (req: Request, res: Response) => {
    const b: any = body; // the body variable is actually a string, this is here to fix a ts error
    var bjson: any = { id: "" }; // boilerplate to not piss off TypeScript.
    bjson = JSON.parse(b)
    let back: any = await util.getBacks();
    if (!back) {
      throw new Error("No online DeblokManager backends found!");
    }
    if (!bjson.id || bjson.id == "") {
      req.statusCode = 400;
      res.send("ERR: The ID field is required.";
    }
    let fr = await fetch(`http://${back}/containers/delete`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {"Authorization":util.getHTTPAuthHeader(back),"Content-Type":"text/plain"}
    });
    let res = await fr.text()
    return res;
  });

  server.get("/api/img/identicon.png", async () => {
    return new Blob([await helper.auth.identicon()]);
  });
/*
  server.get("/api/getbare", async () => {
    return process.env.BARESERVER || "https://tomp.app"
  });
  */

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
      server.listen(config.webserver);
  }
}
