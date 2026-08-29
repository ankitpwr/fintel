import type { Return } from "@prisma/client/runtime/client";
import axios from "axios";

async function getTodo() {
  const res = await axios.get(`https://jsonplaceholder.typicode.com/todos/1`);

  return res.data;
}

type TodoType = Awaited<ReturnType<typeof getTodo>>;

const todo: TodoType = await getTodo();
console.log(todo);
