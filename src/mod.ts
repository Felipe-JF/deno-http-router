// deno-lint-ignore-file require-await
type HttpMethod = "GET" | "POST" | "DELETE" | "UPDATE";

export type Fetch = (request: Request) => Promise<Response>;
export type Middleware = (fetch: Fetch) => Fetch;

export function params(
  request: Request,
  pathname: string,
): Record<string, string> {
  return new URLPattern({ pathname }).exec(request.url)?.pathname.groups ?? {};
}

export class Resource {
  fetch: Fetch;
  pattern: URLPattern;
  constructor(
    pattern: string | URLPattern,
    methods: Partial<Record<HttpMethod, Fetch>>,
    options?: { middleware: Middleware },
  ) {
    const fetchs = new Map<HttpMethod, Fetch>(
      Object.entries(methods) as [HttpMethod, Fetch][],
    );

    this.pattern = pattern instanceof URLPattern
      ? pattern
      : new URLPattern({ pathname: pattern });

    this.fetch = async (request) => {
      const endpoint = fetchs.get(request.method as HttpMethod);
      if (!endpoint) {
        return new Response(undefined, { status: 405 });
      }
      return endpoint(request);
    };

    if (options?.middleware) {
      this.fetch = options.middleware(this.fetch);
    }
  }
}

export class Application {
  private patterns: Map<string, URLPattern>;
  private resources: Map<URLPattern, Fetch>;

  constructor(resources: Resource[]) {
    this.resources = new Map<URLPattern, Fetch>(
      resources.map(({ pattern, fetch }) => [pattern, fetch]),
    );

    this.patterns = new Map(
      [...this.resources.entries()].map(([URLPattern]) => {
        return [URLPattern.pathname, URLPattern] as const;
      }),
    );

    this.fetch = this.fetch.bind(this);
  }

  async fetch(request: Request): Promise<Response> {
    const pattern = this.match(request.url);

    if (!pattern) {
      return new Response(undefined, { status: 404 });
    }

    const route = this.resources.get(pattern)!;

    return route(request);
  }

  private match(url: string) {
    const pattern = this.patterns.get(new URL(url).pathname);

    if (pattern) {
      console.log("hashed");
      return pattern;
    }

    for (const pattern of this.resources.keys()) {
      if (pattern.test(url)) {
        return pattern;
      }
    }
    return;
  }
}
