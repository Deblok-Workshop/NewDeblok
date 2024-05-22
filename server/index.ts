import express from "express";
import type { Request, Response } from "express";
import config from "./config";
import helper from "./modules/helper";
import captcha from "./modules/captcha";
import { rateLimit } from "express-rate-limit";
import cors from "cors";

import wordlistsafe from "./modules/wordlistsafe";
import util from "./modules/util.ts";
import fs from "node:fs";
if (!fs.existsSync(".env")) {
  console.error("ERR: Your .env file is missing.");
  process.exit(1);
}
var endpoints: any = process.env.ENDPOINTS;
try {
  endpoints = endpoints.split(",");
} catch {
  console.error(
    "ERR: You're missing the ENDPOINTS field from your .env file or it is invalid.",
  );
  console.error("ERR: Make sure:");
  console.error("ERR: - Your .env file exists and is valid");
  console.error("ERR: - You aren't accidentally using the example env file.");
  process.exit(1);
}
let netaddr = "[::1]";
netaddr = require("node:os").hostname();
const server = express();
server.set('trust proxy', true)
var HTTPproxy = require("http-proxy");
const WSocket = require("ws");
var bodyParser = require("body-parser");
server.use(bodyParser.raw({ type: "text/plain" }));
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

function trollLinkLeakers(req:Request, res:any, next:any) {
  res.setHeader("Referrer-Policy", "origin");
  const referer = req.headers.origin || req.headers.referer || "";
  let blacklistedReferers = process.env.BLACKLISTED_REFERERS?.split(",") || ["docs.google.com","links.surfskip.com","sites.google.com","google.com"]
  if (blacklistedReferers.includes(referer)) {
    return res.redirect('/j/index.html');
  }
  res.setHeader("Referrer-Policy", "origin");
  next();
}
server.use(trollLinkLeakers)


// Run the startup "job"
require("./modules/startupjob.ts");
server.use("/", express.static("static/"));
server.use(cors()); // Express cors plugin
server.use(rateLimit(config.ratelimit));


if (process.argv.includes("--unavailable") || process.argv.includes("-u")) {
  require("./modules/unavailable.ts");
} else {
  // server.use(staticPlugin({ assets: "static/", prefix: "/" }));
  let dbpwd: any = process.env.DBPWD;
  if (dbpwd) {
    dbpwd = new Bun.CryptoHasher("sha256").update(dbpwd).digest("hex");
  }

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
        res.contentType("png");
        res.send(buf);
      } else {
        res.statusCode = 404;
        res.send("ERR: CAPTCHA not found");
        return;
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
        let result: number = Number(
          captcha.mathfuck.eval(tempdb[req.params.query]),
        );
        console.log(b, Number(b), Number(result));
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
        res.send("ERR: CAPTCHA not found");
        return;
      }
    },
  );
  server.get(
    "/api/captcha/:query/void",
    async (req: Request, res: Response) => {
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
        return;
      }
    },
  );
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
      res.send("ERR: Bad JSON");
      return;
    }
    const usr: string = bjson["usr"];
    var pwd: string = bjson["pwd"];
    const email: string = bjson["em"];
    if (usr == "" || !usr || pwd == "" || !pwd || email == "" || !email) {
      res.statusCode = 400;
      res.send("ERR: One or more fields are missing.");
      return;
    }
    if (pwd.length != 71) {
      res.statusCode = 400;
      res.send("ERR: Invalid input, pwd should be a hash.");
      return;
    }
    if (usr.length != 36) {
      res.statusCode = 400;
      res.send("ERR: Invalid input, usr should be a hash.");
      return;
    }
    if (!String(pwd).startsWith("sha256:") || !String(usr).startsWith("md5:")) {
      res.statusCode = 400;
      res.send("ERR: Invalid input, the hash should be known.");
      return;
    }
    try {
      var db = helper.sql.open("db.sql", true);
      var exists = helper.sql.read(db, "credentials", usr);
      if (exists) {
        res.statusCode = 400;
        res.send("ERR: Username already exists");
        return;
      }
      // TODO: prevent email sharing
      try {
        pwd = await Bun.password.hash(pwd, {
          algorithm: "argon2id", // "argon2id" | "argon2i" | "argon2d"
          memoryCost: 4096, // memory usage in kibibytes
          timeCost: 15, // the number of iterations
        });
      } catch (e) {
        console.error(e);
        res.statusCode = 500;
        res.send(e);
      }
      var guid = crypto.randomUUID();
      helper.sql.write(
        db,
        "credentials",
        usr,
        `u/${usr}/p/${pwd.replaceAll("/", "??")}/e/${btoa(email)}|guid/${guid}`,
      );
      helper.sql.write(
        db,
        "userinfo",
        usr,
        btoa(
          JSON.stringify({ displayName: usr.split(":")[1].substring(0, 16) }),
        ), // don't know real username
      );
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
      res.send("ERR: Bad JSON");
      return;
    }
    const usr: string = bjson["usr"];
    var pwd: string = bjson["pwd"];
    if (usr == "" || !usr || pwd == "" || !pwd) {
      res.statusCode = 400;
      res.send("ERR: One or more fields are missing.");
      return;
    }
    if (pwd.length != 71) {
      res.statusCode = 400;
      res.send("ERR: Invalid input.");
      return;
    }
    if (usr.length != 36) {
      res.statusCode = 400;
      res.send("ERR: Invalid input.");
      return;
    }
    if (!String(pwd).startsWith("sha256:") || !String(usr).startsWith("md5:")) {
      res.statusCode = 400;
      res.send("ERR: Invalid input.");
      return;
    }
    var db = helper.sql.open("db.sql", true);
    var entry: any = helper.sql.read(db, "credentials", usr);
    if (entry) {
      var e: any = entry["value"]; // oohhhhhh
      e = e.split("|");
      e[0] = e[0].split("/");
      let v: any = false;
      try {
        v = await Bun.password.verify(pwd, e[0][3].replaceAll("??", "/"));
      } catch (e) {
        res.statusCode = 500;
        console.error(e);
        res.send(e);
      }
      if (v) {
        res.send(
          btoa(
            `@dblok.cr${Date.now().toString(20)}.ex${(Date.now() + 43200 * 1000).toString(20)}.${btoa(`${usr.substring(6)}.${e[1].split("/")[1]}`)}`,
          ),
        );
      } else {
        res.statusCode = 400;
        res.send("ERR: Password is incorrect.");
        return;
      }
    } else {
      res.statusCode = 400;
      res.send("ERR: Username is incorrect.");
      return;
    }
  });
  server.post(
    "/api/auth/tokenvalidate",
    async (req: Request, res: Response) => {
      try {
        let out = helper.auth.validate(atob(req.body));
        if (out[0]) {
          res.statusCode = 400;
          res.send(`ERR: ${out[1]}`);
          return;
        } else {
          res.send("OK");
        }
      } catch {
        res.statusCode = 400;
        res.end();
      }
    },
  );

  server.post("/api/auth/pwdsafe", async (req: Request, res: Response) => {
    res.send(!wordlistsafe.isSafe(req.body));
  });
  // container management

  server.post("/api/container/create", async (req: Request, res: Response) => {
    try {
      const b: any = req.body; // the body variable is actually a string, this is here to fix a ts error
      var bjson: any = {
        name: "",
        for: "",
        node: -1,
      }; // boilerplate to not piss off TypeScript.
      bjson = JSON.parse(b);
      if (!bjson.name || bjson.name == "" || !bjson.for || bjson.for == "") {
        res.statusCode = 400;
        res.send("ERR: Name and for field is required.");
        return;
      }
      let db = helper.sql.open("db.sql");
      let dbEntry: any = helper.sql.read(db, "userinfo", "md5:" + bjson.for);
      if (!dbEntry["value"]) {
        res.statusCode = 400;
        res.send("ERR: Must provide userid.");
        return;
      }
      let back: any = await util.getBacks();
      if (Number(bjson.node) && Number(bjson.node) != -1) {
        back = endpoints[Number(bjson.node)];
      }
      console.log(Number(bjson.node), back);
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
      let ports: any = await util.getBackPorts(back);
      if (selling.port) {
        selling.ports = `${ports[Math.floor(Math.random()*ports.length)]}:${selling.port}`;
      }
      selling.name = `newdeblok-${bjson.name}-${ports[0]}`;
      let fr = await fetch(`http://${back}/containers/create`, {
        method: "POST",
        body: JSON.stringify(selling),
        headers: {
          Authorization: util.getHTTPAuthHeader(back),
          "Content-Type": "text/plain",
        },
      });
      let resp = await fr.text();
      let sessionsDBentry: any = helper.sql.read(
        db,
        "sessions",
        "md5:" + bjson.for,
      );
      let sessionsEnrtyVal: any = {};
      try {
        sessionsEnrtyVal =
          JSON.parse(atob(sessionsDBentry["value"])) || JSON.parse("{}"); // assume no sessions if it doesnt exist
      } catch {}
      sessionsEnrtyVal[resp] = { id: resp, status: "created" };
      helper.sql.write(
        db,
        "sessions",
        bjson.for,
        btoa(JSON.stringify(sessionsEnrtyVal)),
      );
      res.send({
        port: selling.ports,
        returned: resp,
        fromNode: endpoints.indexOf(back),
      });
    } catch (e) {
      console.error(e);
      res.statusCode = 503;
      res.send(e);
    }
  });

  server.post("/api/container/kill", async (req: Request, res: Response) => {
    const b: any = req.body; // the body variable is actually a string, this is here to fix a ts error
    var bjson: any = { id: "", for: "", node: 0 }; // boilerplate to not piss off TypeScript.
    bjson = JSON.parse(b);
    if (!bjson.id || bjson.id == "" || !bjson.for || bjson.for == "") {
      res.statusCode = 400;
      res.send("ERR: The ID and for field is required.");
      return;
    }
    let db = helper.sql.open("db.sql");
    let dbEntry: any = helper.sql.read(db, "userinfo", "md5:" + bjson.for);
    if (!dbEntry["value"]) {
      res.statusCode = 400;
      res.send("ERR: Must provide userid or it is invalid.");
      return;
    }
    let back: any = await util.getBacks();
    if (!back) {
      res.status(500).send("No online DeblokManager backends found!");
      return;
    }
    if (!Number(bjson.node) || Number(bjson.node) > 0) {
      back = endpoints[Number(bjson.node)];
    }
    let fr = await fetch(`http://${back}/containers/kill`, {
      method: "POST",
      body: JSON.stringify(bjson),
      headers: {
        Authorization: util.getHTTPAuthHeader(back),
        "Content-Type": "text/plain",
      },
    });
    let resp = await fr.text();
    let sessionsDBentry: any = helper.sql.read(
      db,
      "sessions",
      "md5:" + bjson.for,
    );
    let sessionsEnrtyVal;
    try {
      sessionsEnrtyVal =
        JSON.parse(atob(sessionsDBentry["value"])) || JSON.parse("{}"); // assume no sessions if it doesnt exist
    } catch {
      sessionsEnrtyVal = {};
    }
    sessionsEnrtyVal[resp] = { id: resp, status: "killed" };
    helper.sql.write(
      db,
      "sessions",
      bjson.for,
      btoa(JSON.stringify(sessionsEnrtyVal)),
    );
    res.send(resp);
  });
  server.post("/api/container/restart", async (req: Request, res: Response) => {
    const b: any = req.body; // the body variable is actually a string, this is here to fix a ts error
    var bjson: any = { id: "", for: "", node: 0 }; // boilerplate to not piss off TypeScript.
    bjson = JSON.parse(b);
    if (!bjson.id || bjson.id == "" || !bjson.for || bjson.for == "") {
      res.statusCode = 400;
      res.send("ERR: The ID and for field is required.");
      return;
    }
    let db = helper.sql.open("db.sql");
    let dbEntry: any = helper.sql.read(db, "userinfo", "md5:" + bjson.for);
    if (!dbEntry["value"]) {
      res.statusCode = 400;
      res.send("ERR: Must provide userid or it is invalid.");
      return;
    }
    let back: any = await util.getBacks();
    if (!back) {
      res.status(500).send("No online DeblokManager backends found!");
      return;
    }
    if (!Number(bjson.node) || Number(bjson.node) > 0) {
      back = endpoints[Number(bjson.node)];
    }
    let fr = await fetch(`http://${back}/containers/restart`, {
      method: "POST",
      body: JSON.stringify(bjson),
      headers: {
        Authorization: util.getHTTPAuthHeader(back),
        "Content-Type": "text/plain",
      },
    });
    let resp = await fr.text();
    res.send(resp);
  });
  server.get(
    "/api/container/getsessions/:user",
    async (req: Request, res: Response) => {
      const b: any = req.params.user;
      if (!b || b == "") {
        res.statusCode = 400;
        res.send("ERR: The user field is required.");
        return;
        return;
      }
      let db = helper.sql.open("db.sql");
      let sessionsDBentry: any = helper.sql.read(db, "sessions", "md5:" + b);
      res.json(JSON.parse(sessionsDBentry["value"] || "{}"));
    },
  );
  server.get("/api/policy/:node/get", async (req: Request, res: Response) => {
    const b: any = req.params.node;
    if (!b || b == "") {
      res.statusCode = 400;
      res.send("ERR: The node field is required or is invalid.");
      return;
    }
    let resp = await fetch("http://"+endpoints[b]+"/policy/")
    res.json(await resp.json());
  });
  server.get(
    "/api/auth/getuserinfo/:user/",
    async (req: Request, res: Response) => {
      const b: any = req.params.user;
      if (!b || b == "") {
        res.statusCode = 400;
        res.send("ERR: The user field is required.");
        return;
        return;
      }
      try {
      let db = helper.sql.open("db.sql");
      let sessionsDBentry: any = helper.sql.read(db, "userinfo", "md5:" + b);
      res.json(JSON.parse(atob(sessionsDBentry["value"] || btoa("{}"))));
      } catch {
        res.statusCode = 404;
        res.send("ERR: User does not exist.");
      }
    },
  );
  server.post(
    "/api/auth/updatedisplayname/",
    async (req: Request, res: Response) => {
      const b: any = req.body; // the body variable is actually a string, this is here to fix a ts error
      var bjson: any = { newname: "", for: "", auth: "" }; // boilerplate to not piss off TypeScript.
      bjson = JSON.parse(b);
      if (
        !bjson.newname ||
        bjson.newname == "" ||
        !bjson.for ||
        bjson.for == "" ||
        !bjson.auth ||
        bjson.auth == ""
      ) {
        res.statusCode = 400;
        res.send("ERR: All fields are required");
        return;
      }
      if (!helper.auth.validate(bjson.auth)[0]) {
        res.statusCode = 400;
        res.send("ERR: Auth token is errornous.");
        return;
      }
      let db = helper.sql.open("db.sql");
      try {
      let dbEntry: any = helper.sql.read(db, "userinfo", "md5:" + bjson.for);
      if (!dbEntry["value"]) {
        res.statusCode = 400;
        res.send("ERR: Must provide userid or it is invalid.");
        return;
      } 
      let sessionsDBentry: any = helper.sql.read(
        db,
        "userinfo",
        "md5:" + bjson.for,
      );
      let uinfo = JSON.parse(atob(sessionsDBentry["value"] || btoa("{}")));
      uinfo.displayName = bjson.newname;
      helper.sql.write(
        db,
        "userinfo",
        "md5:" + bjson.for,
        btoa(JSON.stringify(uinfo)), // don't know real username
      );
    } catch {
      res.statusCode = 404;
      res.send("ERR: User does not exist.");
    }
      res.send("OK!");
      return;
    },
  );
  server.post("/api/container/delete", async (req: Request, res: Response) => {
    const b: any = req.body; // the body variable is actually a string, this is here to fix a ts error
    var bjson: any = { id: "", for: "", node: 0 }; // boilerplate to not piss off TypeScript.
    bjson = JSON.parse(b);
    if (!bjson.id || bjson.id == "" || !bjson.for || bjson.for == "") {
      res.statusCode = 400;
      res.send("ERR: The ID and for field is required.");
      return;
    }
    let db = helper.sql.open("db.sql");
    let dbEntry: any = helper.sql.read(db, "userinfo", "md5:" + bjson.for);
    if (!dbEntry["value"]) {
      res.statusCode = 400;
      res.send("ERR: Must provide userid or it is invalid.");
      return;
    }
    let back: any = await util.getBacks();
    if (!Number(bjson.node) || Number(bjson.node) > 0) {
      back = endpoints[Number(bjson.node)];
    }
    if (!back) {
      throw new Error("No online DeblokManager backends found!");
    }
    if (!bjson.id || bjson.id == "") {
      res.statusCode = 400;
      res.send("ERR: The ID field is required.");
      return;
    }
    let fr = await fetch(`http://${back}/containers/delete`, {
      method: "POST",
      body: JSON.stringify(bjson),
      headers: {
        Authorization: util.getHTTPAuthHeader(back),
        "Content-Type": "text/plain",
      },
    });
    let resp = await fr.text();
    let sessionsDBentry: any = helper.sql.read(
      db,
      "sessions",
      "md5:" + bjson.for,
    );
    let sessionsEntryVal =
      JSON.parse(atob(sessionsDBentry["value"])) || JSON.parse("{}"); // assume no sessions if it doesnt exist
    sessionsEntryVal[resp] = undefined;
    helper.sql.write(
      db,
      "sessions",
      bjson.for,
      btoa(JSON.stringify(sessionsEntryVal)),
    );
    res.send(resp);
  });
  server.post("/api/container/pause", async (req: Request, res: Response) => {
    const b: any = req.body; // the body variable is actually a string, this is here to fix a ts error
    var bjson: any = { id: "", for: "", node: 0 }; // boilerplate to not piss off TypeScript.
    bjson = JSON.parse(b);
    if (!bjson.id || bjson.id == "" || !bjson.for || bjson.for == "") {
      res.statusCode = 400;
      res.send("ERR: The ID and for field is required.");
      return;
    }
    let db = helper.sql.open("db.sql");
    let dbEntry: any = helper.sql.read(db, "userinfo", "md5:" + bjson.for);
    if (!dbEntry["value"]) {
      res.statusCode = 400;
      res.send("ERR: Must provide userid or it is invalid.");
      return;
    }
    let back: any = await util.getBacks();
    if (!Number(bjson.node) || Number(bjson.node) > 0) {
      back = endpoints[Number(bjson.node)];
    }
    if (!back) {
      throw new Error("No online DeblokManager backends found!");
    }
    if (!bjson.id || bjson.id == "") {
      res.statusCode = 400;
      res.send("ERR: The ID field is required.");
      return;
    }
    let fr = await fetch(`http://${back}/containers/pause`, {
      method: "POST",
      body: JSON.stringify(bjson),
      headers: {
        Authorization: util.getHTTPAuthHeader(back),
        "Content-Type": "text/plain",
      },
    });
    let resp = await fr.text();
    let sessionsDBentry: any = helper.sql.read(
      db,
      "sessions",
      "md5:" + bjson.for,
    );
    let sessionsEnrtyVal =
      JSON.parse(atob(sessionsDBentry["value"])) || JSON.parse("{}"); // assume no sessions if it doesnt exist
    sessionsEnrtyVal[resp] = { id: resp, status: "paused" };
    helper.sql.write(
      db,
      "sessions",
      bjson.for,
      btoa(JSON.stringify(sessionsEnrtyVal)),
    );

    res.send(resp);
  });
  server.post("/api/container/unpause", async (req: Request, res: Response) => {
    const b: any = req.body; // the body variable is actually a string, this is here to fix a ts error
    var bjson: any = { id: "", for: "", node: 0 }; // boilerplate to not piss off TypeScript.
    bjson = JSON.parse(b);
    if (!bjson.id || bjson.id == "" || !bjson.for || bjson.for == "") {
      res.statusCode = 400;
      res.send("ERR: The ID and for field is required.");
      return;
    }
    let db = helper.sql.open("db.sql");
    let dbEntry: any = helper.sql.read(db, "userinfo", "md5:" + bjson.for);
    if (!dbEntry["value"]) {
      res.statusCode = 400;
      res.send("ERR: Must provide userid or it is invalid.");
      return;
    }
    let back: any = await util.getBacks();
    if (!Number(bjson.node) || Number(bjson.node) > 0) {
      back = endpoints[Number(bjson.node)];
    }
    if (!back) {
      throw new Error("No online DeblokManager backends found!");
    }
    if (!bjson.id || bjson.id == "") {
      res.statusCode = 400;
      res.send("ERR: The ID field is required.");
      return;
    }
    let fr = await fetch(`http://${back}/containers/unpause`, {
      method: "POST",
      body: JSON.stringify(bjson),
      headers: {
        Authorization: util.getHTTPAuthHeader(back),
        "Content-Type": "text/plain",
      },
    });
    let resp = await fr.text();
    let sessionsDBentry: any = helper.sql.read(
      db,
      "sessions",
      "md5:" + bjson.for,
    );
    let sessionsEnrtyVal =
      JSON.parse(atob(sessionsDBentry["value"])) || JSON.parse("{}"); // assume no sessions if it doesnt exist
    sessionsEnrtyVal[resp] = { id: resp, status: "started" };
    helper.sql.write(
      db,
      "sessions",
      bjson.for,
      btoa(JSON.stringify(sessionsEnrtyVal)),
    );
    res.send(resp);
  });
  server.post(
    "/api/container/keepalive",
    async (req: Request, res: Response) => {
      const b: any = req.body; // the body variable is actually a string, this is here to fix a ts error
      var bjson: any = { id: "", node: 0 }; // boilerplate to not piss off TypeScript.
      bjson = JSON.parse(b);
      let back: any = await util.getBacks();
      if (!Number(bjson.node) || Number(bjson.node) > 0) {
        back = endpoints[Number(bjson.node)];
      }
      if (!back) {
        throw new Error("No online DeblokManager backends found!");
      }
      if (!bjson.id || bjson.id == "") {
        res.statusCode = 400;
        res.send("ERR: The ID field is required.");
        return;
      }
      try {
        let fr = await fetch(`http://${back}/containers/keepalive`, {
          method: "POST",
          body: req.body,
          headers: {
            Authorization: util.getHTTPAuthHeader(back),
            "Content-Type": "text/plain",
          },
        });
        let resp = await fr.text();
        res.send(resp);
      } catch {
        res.status(500).send("Internal Server Error");
      }
    },
  );
  server.get("/api/img/identicon.png", async (req: Request, res: Response) => {
    res.send(await helper.auth.identicon());
  });

  // proxy
  var proxy = HTTPproxy.createProxyServer({ ws: true });
  server.get("/ws/:node/*", function (req: Request, res: Response) {
    let url = req.url.replace(`/ws/${req.params.node}/`, "");
    req.url = url;
    try {
      proxy.web(req, res, {
        target: "http://" + endpoints[req.params.node].split("@")[1],
      });
    } catch {}
  });

  const proxyServer = require("http").createServer(server);
  // real deal ws proxy
  const wss = new WSocket.Server({ server: proxyServer });
  wss.on("connection", function connection(ws: any, req: any) {
    const target =
      "ws://" +
      endpoints[req.url.split("/")[2]].split("@")[1] +
      "/" +
      req.url.replace(`/ws/${req.url.split("/")[2]}/`, "");
    // @ts-ignore
    const wsProxy = new WebSocket(target);
    // @ts-ignore
    wsProxy.addEventListener("message", (event) => {
      try {
        ws.send(event.data);
      } catch {
        ws.close();
      }
    });
    // @ts-ignore
    wsProxy.addEventListener("close", (event) => {
      ws.close();
    });
    // @ts-ignore
    ws.addEventListener("message", (event) => {
      try {
        wsProxy.send(event.data);
      } catch {
        ws.close();
      }
    });
    // @ts-ignore
    ws.addEventListener("close", (event) => {
      wsProxy.close();
    });
  });

  // proxy upgrade req
  proxyServer.on("upgrade", function (req: any, socket: any, head: any) {
    if (req.url.split("/")[1] == "ws") {
      let url =
        "http://" +
        endpoints[req.url.split("/")[2]].split("@")[1] +
        "/" +
        req.url.replace(`/ws/${req.url.split("/")[2]}/`, "");
      req.url = url;
      try {
        proxy.ws(req, socket, head, { target: req.url });
      } catch {}
    } else {
      socket.send("no");
    }
  });
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
      (config.webserver.ws = true),
      proxyServer.listen(config.webserver);
  }
}
