// What Editor.jsx takes, for TypeScript.
import type { ReactElement } from "react";
import type { Saved } from "./page/types";

type Props = {
  saved: Saved;
  onChange: (saved: Saved) => void;
  previewUrl: string;
  channel: string;
  onHome: () => void;
  status: string;
  publish?: { label: string; onClick: () => void }; // the header's Publish button
};

export default function Editor(props: Props): ReactElement;
