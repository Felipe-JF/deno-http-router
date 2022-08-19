import { serve, ServeInit } from "./deps.ts";

type HttpMethod = "GET" | "POST";

export type Route = (
  request: Request,
  pattern: URLPatternResult,
) => Promise<Response>;

type Routes = Map<string, Map<HttpMethod, Route>>;

export abstract class Controller {
  abstract router: Router;
}

export class Router {
  readonly routes: Routes = new Map();
  constructor(
    private readonly prefix: string,
    routes: Record<string, Partial<Record<Lowercase<HttpMethod>, Route>>>,
  ) {
    this.routes = new Map<string, Map<HttpMethod, Route>>(
      Object
        .entries(routes)
        .map(([pathname, methods]) => {
          return [
            this.prefix + pathname,
            new Map<HttpMethod, Route>(
              Object.entries(methods).map((
                [method, route],
              ) => [method.toUpperCase(), route]) as [HttpMethod, Route][],
            ),
          ] as const;
        }),
    );
  }
}

export class Server {
  private routes: Routes;
  private patternRoutes: [URLPattern, Map<HttpMethod, Route>][] = [];

  constructor(...controllers: Controller[]) {
    this.routes = new Map(
      controllers.flatMap((
        controller,
      ) => [...controller.router.routes.entries()]),
    );
    this.patternRoutes = [...this.routes.entries()].map((
      [pathname, methodRoute],
    ) => [new URLPattern({ pathname }), methodRoute]);
    console.log([...this.routes.entries()]);
  }

  // deno-lint-ignore require-await
  async fetch(request: Request): Promise<Response> {
    let methodNotAllowed = false;
    const hashedResult = this.routes.get(new URLPattern(request.url).pathname);
    if (hashedResult) {
      console.log("Hashed");
      const route = hashedResult.get(request.method as HttpMethod);
      if (route) {
        return route(request, undefined!); // TODO Map<string, [URLPattern, Map<Method, Route>]>
      } else {
        methodNotAllowed = true;
      }
    }
    for (const [urlPattern, methodRoute] of this.patternRoutes) {
      console.log(urlPattern.pathname, request.url);

      const result = urlPattern.exec(request.url);
      if (result) {
        const route = methodRoute.get(request.method as HttpMethod);
        if (route) {
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
