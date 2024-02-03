import { Elysia } from "elysia";
import config from "./config";
import helper from "./helper";
import captcha from "./captcha";
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
server.get("/api/captcha/:query/result.gif", async ({ params: { query } }) => {
  try {
      var q:any = query
      q = new Buffer(query, 'hex')
      q = q.toString('utf8')
      console.log(q)
      // q = captcha.mathfuck.shift(q,-1)
      const imageBuffer = await captcha.mathfuck.img(q,72);
      return new Blob([imageBuffer]);
  } catch (error) {
      console.error('Error generating captcha:', error);
      return {
          status: 500,
          error: error,
      };
  }
});

server.listen(config.webserver);