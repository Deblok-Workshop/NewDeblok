export default {
  // Ratelimit config
  ratelimit: {
    duration: 300 * 1000,
    max: 100,
    responseMessage: "Global rate limit reached.",
    skip: (req:any) => {
      let u = new URL(req.url)
      return !u.pathname.startsWith('/api');}, 
  },

  // Webserver config
  webserver: { port: 8080 },
};
