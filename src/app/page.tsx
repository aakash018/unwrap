// The front door: there is no landing page yet, so it only sends people on.

import { redirect } from "next/navigation";
import { getUser } from "@/lib/user";

export default async function Home() {
  redirect((await getUser()) ? "/gifts" : "/login");
}
