// A sample invitation or gift, to try links with until real ones are published.
'use client';

import { useState } from 'react';
import Viewer from './page/Viewer';
import { startGift, startInvitation } from './templates/start';

export default function Demo({ template, readyMadeId, theme, names, toName, fromName }) {
  const [saved] = useState(() => (template ? startInvitation(template, names) : startGift({ theme, readyMadeId, toName, fromName })));
  return <Viewer saved={saved} />;
}
