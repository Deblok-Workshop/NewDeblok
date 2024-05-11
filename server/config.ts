export default {
  // Ratelimit config
  ratelimit: {
    windowMs: 300 * 1000,
    limit: 100,
    skipFailedRequests: true,
    message: "Global rate limit reached.",
    skip: (req: any) => {
      return !req.path.includes("/api/");
    },
  },
  // Webserver config
  webserver: { port: 8080, ws: true },
};
