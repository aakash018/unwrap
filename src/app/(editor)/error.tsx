// Shown when something can't be opened for editing.
"use client";

import Message from "@/components/editor/Message";

export default function EditorError() {
  return (
    <Message title="This didn't open">
      <button type="button" onClick={() => window.location.reload()} className="underline">
        Try again
      </button>
    </Message>
  );
}
