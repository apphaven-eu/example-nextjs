import { addTodo, deleteTodo } from "./actions";
import { query } from "@/lib/db";

// The list must reflect the database on every request, so nothing is prerendered
// at build time and no page cache is kept.
export const dynamic = "force-dynamic";

type Todo = {
  id: string;
  title: string;
};

export default async function Page() {
  const todos = await query<Todo>(
    "SELECT id, title FROM todos ORDER BY created_at DESC, id DESC",
  );

  return (
    <main>
      <h1>Next.js Todo</h1>
      <p>A shared task list, built with Next.js and PostgreSQL.</p>
      <form className="add" action={addTodo}>
        <input
          type="text"
          name="title"
          aria-label="New task"
          placeholder="What needs doing?"
          maxLength={200}
          required
          autoFocus
        />
        <button className="primary" type="submit">
          Add
        </button>
      </form>
      {todos.length > 0 ? (
        <ul>
          {todos.map((todo) => (
            <li key={todo.id}>
              <span>{todo.title}</span>
              <form action={deleteTodo}>
                <input type="hidden" name="id" value={todo.id} />
                <button type="submit">Delete</button>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty">No items yet.</p>
      )}
      <footer>
        <p>
          Deploy your own on <a href="https://apphaven.eu">AppHaven</a>{" · "}
          <a href="https://github.com/apphaven-eu/example-nextjs">Source code</a>{" · "}
          <a href="https://docs.apphaven.eu/getting-started">Deployment guide</a>
        </p>
      </footer>
    </main>
  );
}
