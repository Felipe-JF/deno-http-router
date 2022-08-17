# deno-http-router
### Warnning, it's not for production, still in the testing and development phase!

A microframework using native Request, Response, URLPattern and deno std/http


# Usage example
```typescript
import { Controller, Server } from "./mod.ts";

class HelloWorldController extends Controller {
  constructor() {
    super("/");
    this.GET("", this.get.bind(this));
  }

  async get(request: Request, pattern: URLPatternResult): Promise<Response> {
    return new Response("Hello World")
  }
}

const helloWorldController = new HelloWorldController();
const server = new Server(helloWorldController);

await server.start({
  port: 8000,
  onListen({ hostname, port }) {
    if (hostname === "0.0.0.0") {
      console.log(`Listening on http://localhost:${port}`);
    } else {
      console.log(`Listening on ${hostname}:${port}`);
    }
  },
});
```
# Testing example
```typescript
Deno.test("Should Hello World", async () => {
  const response = await server.fetch(new Request("http://localhost:8000"));

  const data = await response.text()

  assertEquals(data, "Hello World");
});
```