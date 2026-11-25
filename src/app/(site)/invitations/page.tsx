// /gifts and /invitations are both on Home.

import { redirect } from "next/navigation";

export default function InvitationsPage() {
  redirect("/home");
}
