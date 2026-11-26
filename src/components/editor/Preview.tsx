// The preview of an invitation or gift: its draft, drawn as people will see it.
"use client";

import dynamic from "next/dynamic";
import { previewUrl, type Gift, type Invitation, type Kind } from "@/lib/projects";
import Message from "./Message";
import NotOpened from "./NotOpened";
import { useDraft } from "./use-draft";

const PlainPreview = dynamic(() => import("@/engine/preview/Preview"), { ssr: false });
const DevicePreview = dynamic(() => import("@/engine/preview/DevicePreview"), { ssr: false });

type Props = { owner: string; kind: Kind; id: string; sample: Invitation | Gift | null; framed: boolean };

export default function Preview({ owner, kind, id, sample, framed }: Props) {
  const opened = useDraft(owner, kind, id, sample);

  if (opened.state === "opening") return <Message title="Opening…" />;
  if (opened.state !== "open") return <NotOpened kind={kind} state={opened.state} />;
  if (framed) return <PlainPreview saved={opened.saved} since={opened.edited} channel={id} toName={opened.toName} />;
  return <DevicePreview saved={opened.saved} since={opened.edited} channel={id} framedUrl={`${previewUrl(kind, id)}?framed`} toName={opened.toName} />;
}
