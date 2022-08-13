import type { Controller } from "./Controller.ts";
import { serve, ServeInit } from "./deps.ts";
import type { Pattern } from "./Pattern.ts";
import type { Route } from "./Route.ts";

export class Server {
  private routes = new Map<Pattern, Route>();
  constructor(...resources: Controller[]) {
    for (const resource of resources) {
      for (const [pattern, route] of resource.routes.entries()) {
        this.routes.set(pattern, route);
      }
    }
  }

  // deno-lint-ignore require-await
  async fetch(request: Request): Promise<Response> {
    let methodNotAllowed = false;
    for (const [{ urlPattern, method }, route] of this.routes) {
      const result = urlPattern.exec(request.url);
      if (result) {
        if (request.method === method) {
          return route(request, result);
        } else {
          methodNotAllowed = true;
        }
      }
    }

    if (methodNotAllowed) {
      return new Response("Method not allowed", { status: 405 });
    }

    return new Response("Not found", { status: 404 });
  }

  start(options: ServeInit) {
    return serve(this.fetch.bind(this), options);
  }
}
