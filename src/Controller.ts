import type { Pattern } from "./Pattern.ts";
import type { Route } from "./Route.ts";

export abstract class Controller {
  public routes = new Map<Pattern, Route>();

  constructor(private prefix: string) {
  }

  protected GET(pathname: string, route: Route) {
    return this.usePath("GET", pathname, route);
  }

  protected POST(pathname: string, route: Route) {
    return this.usePath("POST", pathname, route);
  }

  protected DELETE(pathname: string, route: Route) {
    return this.usePath("DELETE", pathname, route);
  }

  protected UPDATE(pathname: string, route: Route) {
    return this.usePath("UPDATE", pathname, route);
  }

  protected PUT(pathname: string, route: Route) {
    return this.usePath("PUT", pathname, route);
  }

  protected usePath(
    method: Pattern["method"],
    pathname: string,
    route: Route,
  ) {
    return this.usePattern({
      method,
      urlPattern: new URLPattern({ pathname: this.prefix + pathname }),
    }, route);
  }

  protected usePattern(pattern: Pattern, route: Route) {
    this.routes.set(pattern, route);
    return this;
  }
}
