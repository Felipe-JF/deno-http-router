// deno-lint-ignore-file require-await
import { serve } from "./deps.ts";
import { Application, Middleware, Resource } from "./mod.ts";

const log: Middleware = (next) => async (request) => {
  const response = await next(request);
  console.log({ request, response });
  return response;
};

const example = new Resource("/example", {
  GET: async () => new Response("Hello world!"),
});

const todo = new Resource("/todos/:id", {
  GET: async () => new Response("GET Todo"),
  POST: async () => new Response("POST Todo"),
  UPDATE: async () => new Response("UPDATE Todo"),
  DELETE: async () => new Response("DELETE Todo"),
});

const middlewareExample = new Resource("/example/middleware", {
  GET: async () => new Response("Hello world!"),
}, {
  middleware: log,
});

const pattern = new URLPattern({
  pathname: "/example/pattern",
  protocol: "https",
  port: "8000",
});

const patternExample = new Resource(pattern, {
  GET: async () => new Response("Hello world!"),
});

const application = new Application([example, todo, middlewareExample]);

await serve(application.fetch);
