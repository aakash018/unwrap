// Drafts kept in this browser (IndexedDB), from before they were saved in the
// database (26 Nov 2026). Only read now, to move them into the account
// (components/home/MoveDrafts.tsx), and deleted once they're there.

import { upgrade } from "@/engine/page/format";
import type { Saved } from "@/engine/page/types";

export type Draft = {
  key: string; // owner + id
  owner: string; // the account's id
  id: string;
  saved: Saved;
  toName?: string; // who a gift is for
  edited: number; // when, in milliseconds
};

// As it may be stored: drafts from before 25 November 2026 have `page`.
type Stored = Omit<Draft, "saved"> & { saved?: Saved; page?: unknown };

const NAME = "unwrap";
const STORE = "drafts";
const keyOf = (owner: string, id: string) => `${owner}/${id}`;

const upToDate = ({ page, ...stored }: Stored): Draft => ({ ...stored, saved: upgrade(stored.saved ?? page) });

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE, { keyPath: "key" }).createIndex("owner", "owner");
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Do one thing with the store, then close it.
async function inStore<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  try {
    return await new Promise<T>((resolve, reject) => {
      const change = db.transaction(STORE, mode);
      const request = action(change.objectStore(STORE));
      change.oncomplete = () => resolve(request.result);
      change.onerror = change.onabort = () => reject(change.error ?? request.error);
    });
  } finally {
    db.close();
  }
}

export async function deleteDraft(owner: string, id: string): Promise<void> {
  await inStore("readwrite", (store) => store.delete(keyOf(owner, id)));
}

// All of one account's drafts, the latest first.
export async function listDrafts(owner: string): Promise<Draft[]> {
  const stored = await inStore<Stored[]>("readonly", (store) => store.index("owner").getAll(owner));
  return stored.map(upToDate).sort((a, b) => b.edited - a.edited);
}
