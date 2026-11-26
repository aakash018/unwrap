// What DevicePreview.jsx takes, for TypeScript.
import type { ReactElement } from "react";
import type { Saved } from "../page/types";

export default function DevicePreview(props: { saved: Saved; since: number; channel: string; framedUrl: string; toName?: string }): ReactElement;
