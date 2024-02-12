export default {
  // Ratelimit config
  ratelimit: {
    duration: 300 * 1000,
    max: 100,
    responseMessage: "Global rate limit reached.",
    skip: (req:any) => {return !new URL(req.url).pathname.startsWith('/api')},
  },
  // Webserver config
  webserver: { port: 8080 },
};
