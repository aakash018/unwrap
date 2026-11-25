// An invitation or gift as people will see it, updating live while it's being
// edited. `saved` = its draft, saved at `since`; `channel` = its id (see channel.js).
'use client';

import { useEffect, useState } from 'react';
import Viewer from '../page/Viewer';
import { followEditor } from './channel';

export default function Preview({ saved, since, channel }) {
  const [latest, setLatest] = useState(saved);
  useEffect(() => followEditor(channel, since, setLatest), [channel, since]);
  return <Viewer saved={latest} />;
}
