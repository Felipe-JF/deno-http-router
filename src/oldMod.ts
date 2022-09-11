// deno-lint-ignore-file require-await
type HttpMethod = "GET" | "POST" | "DELETE" | "UPDATE";

export interface Context {
  result: URLPatternResult;
}

export type Route = (request: Request, context: Context) => Promise<Response>;

type Fetch = (request: Request) => Promise<Response>;

type Routes = Map<URLPattern, Route>;

type Middleware = (fetch: Fetch) => Fetch;

export function params(
  request: Request,
  pathname: string,
): Record<string, string> {
  return new URLPattern({ pathname }).exec(request.url)?.pathname.groups ?? {};
}

export class Router {
  readonly routes: Routes;
  constructor(
    routes: Record<
      string,
      Partial<Record<HttpMethod, Route>>
    >,
  ) {
    this.routes = new Map(
      Object.entries(routes).map(([pathname, methodsRecord]) => {
        const methods = new Map(
          Object.entries(methodsRecord),
        );

        const methodsRoute: Route = async (request, context) => {
          const route = methods.get(request.method);
          if (!route) {
            return new Response(undefined, { status: 405 });
          }
          return route(request, context);
        };

        return [
          new URLPattern({ pathname }),
          methodsRoute,
        ] as const;
      }),
    );
  }
}
export class Resource {
  fetch: Fetch;
  pattern: URLPattern;
  constructor(pattern: string, methods: Partial<Record<HttpMethod, Fetch>>) {
    const fetchs = new Map<HttpMethod, Fetch>(
      Object.entries(methods) as [HttpMethod, Fetch][],
    );

    this.pattern = new URLPattern({ pathname: pattern });
    this.fetch = async (request) => {
      const fetch = fetchs.get(request.method as HttpMethod);
      if (!fetch) {
        return new Response(undefined, { status: 405 });
      }
      return fetch(request);
    };
  }
}
export class Server {
  private routes: Routes;
  private patterns: Map<string, URLPattern>;

  constructor(...routers: Router[]) {
    this.routes = new Map(
      routers.flatMap((router) => [...router.routes.entries()]),
    );

    this.patterns = new Map([...this.routes.entries()].map(([URLPattern]) => {
      return [URLPattern.pathname, URLPattern] as const;
    }));

    this.fetch = this.fetch.bind(this);
  }

  async fetch(request: Request): Promise<Response> {
    const pattern = this.match(request.url);

    if (!pattern) {
      return new Response(undefined, { status: 404 });
    }

    const route = this.routes.get(pattern)!;

    return route(request, {
      result: pattern.exec(request.url)!,
    });
  }

  private match(url: string) {
    const pattern = this.patterns.get(new URL(url).pathname);

    if (pattern) {
      console.log("hashed");
      return pattern;
    }

    for (const pattern of this.routes.keys()) {
      if (pattern.test(url)) {
        return pattern;
      }
    }
    return;
  }
}
