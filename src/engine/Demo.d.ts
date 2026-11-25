// What Demo.jsx takes, for TypeScript.
import type { ReactElement } from "react";
import type { ReadyMadeId, TemplateId, ThemeId } from "./page/types";

type Props = {
  template?: TemplateId;
  theme?: ThemeId;
  readyMadeId?: ReadyMadeId;
  names?: string[];
  toName?: string;
  fromName?: string;
};

export default function Demo(props: Props): ReactElement;
