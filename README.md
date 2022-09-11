# deno-http-router
## Warnning, it's not for production, still in the testing and development phase!

A microframework using native Request, Response, URLPattern

### Usage example
```typescript
import { Controller, Server } from "./mod.ts";

const example = new Resource("/example", {
  GET: async () => new Response("Hello world!"),
});

const application = new Application([example]);

await serve(application.fetch);
```

### Testing example
```typescript
Deno.test("Resource", async () => {
  const example = new Resource("/example", {
    GET: async () => new Response("Hello world!"),
  });

  const application = new Application([example]);

  const response = await application.fetch(new Request("http://localhost:8000/example"));

  const data = await response.text()

  assertEquals(data, "Hello world!");
});
```

### Todo example
```typescript
const exampleResource = new Resource("/todos/:id", {
  GET: async () => new Response("GET Todo"),
  POST: async () => new Response("POST Todo"),
  UPDATE: async () => new Response("UPDATE Todo"),
  DELETE: async () => new Response("DELETE Todo"),
});

const application = new Application([exampleResource]);

await serve(application.fetch);
```

### Example with middleware
```typescript

const log: Middleware = (next) => async (request) => {
  const response = await next(request);
  console.log({ request, response });
  return response;
};

const exampleResource = new Resource("/example", {
  GET: async () => new Response("Hello world!"),
}, {
  middleware: log,
});

const application = new Application([exampleResource]);

await serve(application.fetch);
```

### Example with middleware
```typescript
const pattern = new URLPattern({
  pathname: "/example/pattern",
  protocol: "https",
  port: "8000",
});

const exampleResource = new Resource(pattern, {
  GET: async () => new Response("Hello world!"),
});

const application = new Application([exampleResource]);

await serve(application.fetch);
```