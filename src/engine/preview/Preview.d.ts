// What Preview.jsx takes, for TypeScript.
import type { ReactElement } from "react";
import type { Saved } from "../page/types";

export default function Preview(props: { saved: Saved; since: number; channel: string; toName?: string }): ReactElement;
