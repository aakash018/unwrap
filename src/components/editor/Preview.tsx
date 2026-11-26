// The preview of an invitation or gift: its draft, drawn as people will see
// it. It follows the editor's changes as they're made (engine/preview/channel.js).
"use client";

import dynamic from "next/dynamic";
import type { Saved } from "@/engine/page/types";
import { previewUrl, type Kind } from "@/lib/projects";

const PlainPreview = dynamic(() => import("@/engine/preview/Preview"), { ssr: false });
const DevicePreview = dynamic(() => import("@/engine/preview/DevicePreview"), { ssr: false });

type Props = { kind: Kind; id: string; saved: Saved; toName?: string; edited: number; framed: boolean };

// (`edited` is the server's time, the editor's changes this computer's: a
// little slack, in case the two clocks differ)
const SLACK_MS = 120_000;

export default function Preview({ kind, id, saved, toName, edited: savedAt, framed }: Props) {
  const edited = savedAt - SLACK_MS;
  if (framed) return <PlainPreview saved={saved} since={edited} channel={id} toName={toName} />;
  return <DevicePreview saved={saved} since={edited} channel={id} framedUrl={`${previewUrl(kind, id)}?framed`} toName={toName} />;
}
