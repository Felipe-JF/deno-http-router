// deno-lint-ignore-file require-await
import { assertEquals } from "asserts";
import { Application, Resource } from "../mod.ts";

Deno.test("Resource", async () => {
  const example = new Resource("/example", {
    GET: async () => new Response("Hello world!"),
  });

  const application = new Application([example]);

  const response = await application.fetch(
    new Request("http://localhost:8000/example"),
  );

  const data = await response.text();

  assertEquals(data, "Hello world!");
});
