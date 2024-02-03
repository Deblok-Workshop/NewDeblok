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
server.get("/api/testing/captcha", async ({ params: { dense } }) => {
  try {
      const imageBuffer = await captcha.mathfuck.img('ඞ=_ඞ6ඞ-6ඞ_ඞ?_ඞ6ඞ-6ඞ_ඞ?3ඞ.3',72);
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