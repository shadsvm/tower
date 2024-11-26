const server = Bun.serve({
  development: true,
  port: 3000,
  static: {
    "/api/version": Response.json({ version: "1.0.0", bun: Bun.version }),
    "/api/health": new Response("All good!"),
  },
  fetch(req) {
    const url = new URL(req.url);
    switch (url.pathname) {
      case "/": {
        return new Response("Blog!");
      }
      case "/blog": {
        return new Response("Blog!");
      }
      default:
        throw new Error("Invalid pathname!");
    }
  },
  error(error) {
    return new Response(`<pre>${error}\n${error.stack}</pre>`, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  },
});

console.log(`Listening on http://localhost:${server.port} ...`);
