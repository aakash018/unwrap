// Your initial in the corner: who you are, and signing out.

import { signOut } from "@/app/auth/actions";
import type { User } from "@/lib/user";
import Menu, { MENU_ITEM } from "./Menu";
import NotYetButton from "./NotYetButton";

export default function AccountMenu({ user }: { user: User }) {
  const initial = Array.from(user.name)[0]?.toUpperCase() ?? "?";

  return (
    <Menu
      label="Your account"
      button={initial}
      buttonClass="grid size-11 cursor-pointer place-items-center rounded-full bg-hover text-[15px] font-semibold transition-colors hover:bg-line focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine"
    >
      <div className="px-3 pt-2 pb-3">
        <p className="truncate font-medium">{user.name}</p>
        <p className="truncate text-sm text-soft">{user.email}</p>
      </div>
      <div className="border-t border-line pt-2">
        <NotYetButton what="Entering a code" className={MENU_ITEM}>
          Enter an activation code
        </NotYetButton>
        <form action={signOut}>
          <button type="submit" className={MENU_ITEM}>
            Sign out
          </button>
        </form>
      </div>
    </Menu>
  );
}
