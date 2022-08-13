import { Controller, Server } from "../mod.ts";
import { assertEquals } from "asserts";

Deno.test("Should get all Todos", async () => {
  const { server } = setup();

  const response = await server.fetch(new Request("http://localhost/todos"));

  const todos = await response.json() as Todos;

  assertEquals(todos, [{ id: "0", title: "Some todo" }]);
});

Deno.test("Should get one Todo", async () => {
  const { server } = setup();

  const response = await server.fetch(new Request("http://localhost/todos/0"));

  const todo = await response.json() as Todo;

  assertEquals(todo, { id: "0", title: "Some todo" });
});

interface Todo {
  id: string;
  title: string;
}
type Todos = readonly Todo[];

class TodoController extends Controller {
  constructor() {
    super("/todos");
    this
      .GET("/:id?", this.read.bind(this));
  }

  // deno-lint-ignore require-await
  async read(_request: Request, pattern: URLPatternResult): Promise<Response> {
    const { id } = pattern.pathname.groups;

    if (id) {
      if (id === "0") {
        return Response.json(<Todo> { id: "0", title: "Some todo" });
      }
      return new Response("Bad request", { status: 400 });
    }

    return Response.json(<Todos> [{ id: "0", title: "Some todo" }]);
  }
}

function setup() {
  const todoController = new TodoController();
  const server = new Server(todoController);
  return { server };
}
