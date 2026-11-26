// What Loader.jsx takes, for TypeScript.
import type { ReactElement, ReactNode } from "react";
import type { ThemeId } from "./types";

export const OPENING_WORDS: string;
export const WORDS_SUGGESTED: string[];
export default function Loader(props: { theme?: ThemeId; name?: string; words?: string; children?: ReactNode }): ReactElement;
