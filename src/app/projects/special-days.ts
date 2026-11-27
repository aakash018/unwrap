// What the browser asks the server to do with special days: add one, remove
// one. Each checks who is signed in; the database only lets them reach their own.
"use server";

import { revalidatePath } from "next/cache";
import { addSpecialDay, deleteSpecialDay, type Kind } from "@/lib/special-days";
import { getUser } from "@/lib/user";

type Result = { ok: true } | { ok: false; problem: string };

const KINDS: Kind[] = ["birthday", "anniversary", "day"];

export async function rememberDay(input: { person: string; kind: Kind; label?: string; date: string }): Promise<Result> {
  if (!(await getUser())) return { ok: false, problem: "You're signed out. Sign in again, then try once more." };
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input.date ?? "");
  if (!match || !input.person?.trim() || !KINDS.includes(input.kind)) return { ok: false, problem: "Add a name and a date." };
  const [, year, month, day] = match.map(Number);
  try {
    await addSpecialDay({ person: input.person, kind: input.kind, label: input.label, month, day, year: year >= 1900 ? year : undefined });
    revalidatePath("/home");
    return { ok: true };
  } catch (problem) {
    console.error("A special day wasn't saved:", problem);
    return { ok: false, problem: "That didn't work. Please try again." };
  }
}

export async function forgetDay(id: string): Promise<Result> {
  if (!(await getUser())) return { ok: false, problem: "You're signed out." };
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { ok: false, problem: "No such day." };
  try {
    await deleteSpecialDay(id);
    revalidatePath("/home");
    return { ok: true };
  } catch (problem) {
    console.error("A special day wasn't removed:", problem);
    return { ok: false, problem: "That didn't work. Please try again." };
  }
}
