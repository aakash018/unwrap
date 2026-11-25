// Shown for a link that doesn't exist.

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-paper px-6 text-center">
      <h1 className="font-display text-4xl text-cocoa">There&apos;s nothing here</h1>
      <p className="mt-3 text-ink-soft">Check the link, or ask the person who sent it.</p>
    </main>
  );
}
