import { Controller, Server } from "../mod.ts";

class HelloWorldController extends Controller {
  constructor() {
    super("/");
    this.GET("", this.get.bind(this));
  }

  // deno-lint-ignore require-await
  async get(_request: Request, _pattern: URLPatternResult): Promise<Response> {
    return new Response("Hello World");
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
