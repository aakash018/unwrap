// An invitation or gift as people will see it, updating live while it's being
// edited. `saved` = its draft, saved at `since`; `channel` = its id (see channel.js).
'use client';

import { useEffect, useState } from 'react';
import Viewer from '../page/Viewer';
import Loader from '../page/Loader';
import { followEditor } from './channel';

// A gift opens with its loader, as it will for the person it's for (`toName`:
// who it's for, for drafts from before it was saved with the gift).
export default function Preview({ saved, since, channel, toName }) {
  const [latest, setLatest] = useState(saved);
  useEffect(() => followEditor(channel, since, setLatest), [channel, since]);
  if (latest.kind !== 'gift') return <Viewer saved={latest} />;
  const { name = toName, words } = latest.opening ?? {};
  return (
    <Loader theme={latest.theme} name={name} words={words}>
      <Viewer saved={latest} />
    </Loader>
  );
}
