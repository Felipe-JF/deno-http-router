export type Route = (
  request: Request,
  pattern: URLPatternResult,
) => Promise<Response>;
