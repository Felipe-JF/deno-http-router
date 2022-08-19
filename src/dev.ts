import { Controller, Router, Server } from "./mod.ts";

class ExampleController extends Controller {
  router = new Router("/example", {
    "/helloworld": {
      get: this.helloWorld.bind(this),
    },
  });

  // deno-lint-ignore require-await
  async helloWorld(
    _request: Request,
    _pattern: URLPatternResult,
  ): Promise<Response> {
    return new Response("Hello World");
  }
}

const exampleController = new ExampleController();

const server = new Server(exampleController);

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
