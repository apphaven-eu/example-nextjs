"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { query } from "@/lib/db";

export async function addTodo(formData: FormData): Promise<void> {
  const value = formData.get("title");
  const title = typeof value === "string" ? value.trim() : "";
  if (title) {
    await query("INSERT INTO todos (title) VALUES ($1)", [Array.from(title).slice(0, 200).join("")]);
  }
  revalidatePath("/");
  // Sends clients without JavaScript back to "/" with a GET, so a refresh does
  // not resubmit the form.
  redirect("/");
}

export async function deleteTodo(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  if (Number.isSafeInteger(id)) {
    await query("DELETE FROM todos WHERE id = $1", [id]);
  }
  revalidatePath("/");
  redirect("/");
}
