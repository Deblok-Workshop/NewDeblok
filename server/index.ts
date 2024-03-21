import { Elysia, error } from "elysia";
import config from "./config";
import helper from "./modules/helper";
import captcha from "./modules/captcha";
import { rateLimit } from "elysia-rate-limit";
import { staticPlugin } from "@elysiajs/static";
import { cors } from "@elysiajs/cors";
import fetch from "node-fetch";
import wordlistsafe from "./modules/wordlistsafe";

let endpoints: any = process.env.ENDPOINTS;
endpoints = endpoints.split(",");
let netaddr = "[::1]";
netaddr = require("node:os").hostname();
const server = new Elysia();

// errors

server.onError(({ code, error, set }) => {
  if (code === "NOT_FOUND") {
    set.status = 404;

    return Bun.file("static/404.html");
  }
  if (code === "INTERNAL_SERVER_ERROR") {
    set.status = 500;

    return Bun.file("static/500.html");
  }
});

// Run the startup "job"
require("./modules/startupjob.ts");

server.use(cors()); // ElysiaJS cors plugin
server.use(rateLimit(config.ratelimit));
if (process.argv.includes("--unavailable") || process.argv.includes("-u")) {
  require("./unavailable.ts");
} else {
  server.use(staticPlugin({ assets: "static/", prefix: "/" }));

  let dbpwd: any = process.env.DBPWD;
  dbpwd = new Bun.CryptoHasher("sha256").update(dbpwd).digest("hex");

  // general

  server.get("/favicon.ico", async ({ set }) => {
    // fallback
    set.redirect = "/assets/favicon.png";
  });
 

  async function ping(url: string): Promise<string> {
    try {
      const response = await fetch("https://" + url);
      if (response.status >= 200 && response.status < 400) {
        return "up";
      } else {
        return "down";
      }
    } catch (error) {
      return "down";
    }
  }
  server.get("/api/", () => {
    return "Welcome to Deblok!";
  });

  async function healthcheck() {
    let backendstat: any[] = [];
    for (let i = 0; i < endpoints.length; i++) {
      backendstat[backendstat.length] = await ping(endpoints[i]);
    }
    return { api: "up", backend: backendstat };
  }
  async function getBacks() {
    let hc = (await healthcheck()).backend;
    for (let i = 0; i < hc.length; i++) {
      if (hc[i].status === "up") {
        return endpoints[i];
      }
    }
    console.warn("WARN: No online DeblokManager server found");
    return null;
  }
  async function getBackPorts(server: string) {
    let hc = (await healthcheck()).backend;
    try {
      let res = await fetch("https://" + server + "/ports/list");
      return await res.text();
    } catch (e) {
      return e;
    }
  }

  server.get("/api/__healthcheck", async () => {
    // using /api/__healthcheck to be compatible with Kasmweb's API format
    return await healthcheck();
  });

  server.get("/api/healthcheck", async () => {
    // alias
    return await healthcheck();
  });

  // captcha

  server.get(
    "/api/captcha/:query/image.gif",
    async ({ params: { query }, set }) => {
      var tempdbfile: Blob = Bun.file("tempcaptcha.db");
      var tempdb = JSON.parse(await tempdbfile.text());
      if (tempdb[query] != undefined) {
        var buf = await captcha.mathfuck.img(tempdb[query]);
        return new Blob([buf]);
      } else {
        set.status = 404;
        return "ERR: CAPTCHA not found";
      }
    },
  );
  server.post(
    "/api/captcha/:query/validate",
    async ({ body, params: { query }, set }) => {
      var b: any = body;
      var rv = false;
      var tempdbfile: Blob = Bun.file("tempcaptcha.db");
      var tempdb = JSON.parse(await tempdbfile.text());
      if (tempdb[query] != undefined) {
        if (Number(b) != Number(captcha.mathfuck.eval(tempdb[query]))) {
          rv = false;
        } else {
          rv = true;
        }
        tempdb[query] = undefined;
        Bun.write("./tempcaptcha.db", JSON.stringify(tempdb));
        return rv;
      } else {
        set.status = 404;
        return "ERR: CAPTCHA not found";
      }
    },
  );
  server.get("/api/captcha/:query/void", async ({ params: { query }, set }) => {
    var tempdbfile: Blob = Bun.file("tempcaptcha.db");
    var tempdb = JSON.parse(await tempdbfile.text());
    if (tempdb[query] != undefined) {
      tempdb[query] = undefined;
      Bun.write("./tempcaptcha.db", JSON.stringify(tempdb));
      set.status = 204;
      return "";
    } else {
      set.status = 404;
      return "ERR: CAPTCHA not found";
    }
  });
  server.get("/api/captcha/request", async () => {
    var tempdbfile: Blob = Bun.file("tempcaptcha.db");
    var tempdb = JSON.parse(await tempdbfile.text());
    var randuuid = crypto.randomUUID();
    tempdb[randuuid] = captcha.mathfuck.random();
    Bun.write("./tempcaptcha.db", JSON.stringify(tempdb));
    return randuuid;
  });
  server.post("/api/auth/signup", async ({ body, set }) => {
    const b: any = body; // the body variable is actually a string, this is here to fix a ts error
    let bjson: any = { usr: "", pwd: "", em: "" };
    try {
      bjson = JSON.parse(b);
    } catch (e) {
      console.error(e);
      set.status = 400;
      return "ERR: Bad JSON";
    }
    const usr: string = bjson["usr"];
    var pwd: string = bjson["pwd"];
    const email: string = bjson["em"];
    if (usr == "" || !usr || pwd == "" || !pwd || email == "" || !email) {
      set.status = 400;
      return "ERR: One or more fields are missing.";
    }
    if (pwd.length != 71) {
      set.status = 400;
      return "ERR: Invalid input.";
    }
    if (usr.length != 36) {
      set.status = 400;
      return "ERR: Invalid input.";
    }
    if (!String(pwd).startsWith("sha256:") || !String(usr).startsWith("md5:")) {
      set.status = 400;
      return "ERR: Invalid input.";
    }
    try {
      var db = helper.sql.open("db.sql", true);
      var exists = helper.sql.read(db, "credentials", usr);
      if (exists) {
        set.status = 400;
        return "ERR: Username already exists";
      }
      // TODO: prevent email sharing
      try {
        pwd = await Bun.password.hash(pwd);
      } catch (e) {
        return e;
      }
      var guid = crypto.randomUUID();
      helper.sql.write(
        db,
        "credentials",
        usr,
        `u/${usr}/p/${pwd}/e/${btoa(email)}|guid/${guid}`,
      );
      return guid;
    } catch (e) {
      console.error(e);
      set.status = 500;
      return e;
    }
  });

  // authentication

  server.post("/api/auth/login", async ({ body, set }) => {
    const b: any = body; // the body variable is actually a string, this is here to fix a ts error
    var bjson: any = { usr: "", pwd: "", em: "" };
    try {
      bjson = JSON.parse(b);
    } catch (e) {
      console.error(e);
      set.status = 400;
      return "ERR: Bad JSON";
    }
    const usr: string = bjson["usr"];
    var pwd: string = bjson["pwd"];
    if (usr == "" || !usr || pwd == "" || !pwd) {
      set.status = 400;
      return "ERR: One or more fields are missing.";
    }
    if (pwd.length != 71) {
      set.status = 400;
      return "ERR: Invalid input.";
    }
    if (usr.length != 36) {
      set.status = 400;
      return "ERR: Invalid input.";
    }
    if (!String(pwd).startsWith("sha256:") || !String(usr).startsWith("md5:")) {
      set.status = 400;
      return "ERR: Invalid input.";
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
        set.status = 500;
        console.error(e);
        return "err";
      }
      if (v) {
        return btoa(
          `@dblok.cr${Date.now().toString(20)}.ex${(Date.now() + 43200 * 1000).toString(20)}.${btoa(`${usr.substring(6)}.${e[1].split("/")[1]}`)}`,
        );
      } else {
        set.status = 400;
        return "ERR: Password is incorrect.";
      }
    } else {
      set.status = 400;
      return "ERR: Username is incorrect.";
    }
  });
  server.post("/api/auth/tokenvalidate", async ({ body, set }) => {
    let out = helper.auth.validate(atob(body));
    if (out[0]) {
      set.status = 400;
      return `ERR: ${out[1]}`;
    } else {
      return "OK";
    }
  });

  server.post("/api/auth/pwdsafe", async ({ body, set }) => {
    return !wordlistsafe.isSafe(body);
  });
  // container management

  server.post("/api/container/create", async ({ body, set }) => {
    // TODO
    const b: any = body; // the body variable is actually a string, this is here to fix a ts error
    var bjson: any = {
      name: "",
    }; // boilerplate to not piss off TypeScript.
    if (!bjson.name || bjson.name == "") {
      set.status = 400;
      return "ERR: Name field is required.";
    }
    let back: any = await getBacks();
    if (!back) {
      throw new Error("No online DeblokManager backends found!");
    }
    let dockconff = Bun.file("docker/containers.json");
    let dconf = await dockconff.json();
    if (dconf[bjson.name.toLowerCase()] == undefined) {
      set.status = 404;
      return "Image could not be found in configuration.";
    }
    let selling: any = dconf[bjson.name.toLowerCase()];
    if (selling.port) {
      let ports: any = await getBackPorts(await getBacks());
      selling.ports = `${ports[0]}:${selling.port}`;
    }
    let fr = await fetch(`https://${back}/containers/create`, {
      method: "POST",
      body: JSON.stringify(selling),
    });
    return fr;
  });

  server.post("/api/container/kill", async ({ body, set }) => {
    const b: any = body; // the body variable is actually a string, this is here to fix a ts error
    var bjson: any = { id: "" }; // boilerplate to not piss off TypeScript.
    let back: any = await getBacks();
    if (!back) {
      throw new Error("No online DeblokManager backends found!");
    }
    if (!bjson.id || bjson.id == "") {
      set.status = 400;
      return "ERR: The ID field is required.";
    }
    let fr = await fetch(`https://${back}/containers/kill`, {
      method: "POST",
      body: JSON.stringify(body),
    });

    return fr;
  });

  server.post("/api/container/delete", async ({ body, set }) => {
    const b: any = body; // the body variable is actually a string, this is here to fix a ts error
    var bjson: any = { id: "" }; // boilerplate to not piss off TypeScript.
    let back: any = await getBacks();
    if (!back) {
      throw new Error("No online DeblokManager backends found!");
    }
    if (!bjson.id || bjson.id == "") {
      set.status = 400;
      return "ERR: The ID field is required.";
    }
    let fr = await fetch(`https://${back}/containers/delete`, {
      method: "POST",
      body: JSON.stringify(body),
    });

    return fr;
  });

  server.get("/api/img/identicon.png", async ({ body, set }) => {
    return new Blob([await helper.auth.identicon()]);
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
      server.listen(config.webserver);
  }
}
