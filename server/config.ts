export default {
  // Ratelimit config
  ratelimit: {
    windowMs: 300 * 1000,
    limit: 100,
    skipFailedRequests: true,
    message: "Global rate limit reached.",
    skip: (req: any) => {
      console.log(req)
      return false;
    },
  },
  // Webserver config
  webserver: { port: 8080, ws: true },
};
