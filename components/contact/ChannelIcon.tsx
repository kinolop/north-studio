import type { ChannelId } from "@/lib/channels";

export type IconId = ChannelId | "brief";

/**
 * One icon family, one stroke weight, drawn rather than imported.
 *
 * Four glyphs do not justify an icon library, and hand-drawing them keeps
 * the stroke identical to the arrow on the primary button — mixing a 2px
 * library icon with a 1.25px hand-drawn one is the kind of mismatch that
 * reads as "assembled" rather than "designed".
 */
const PATHS: Record<IconId, string> = {
  // Paper plane, flown level.
  telegram: "M21.5 3.5 2.9 10.6a.5.5 0 0 0 .04.94l4.6 1.44 1.72 5.2a.5.5 0 0 0 .87.16l2.5-2.9 4.7 3.45a.5.5 0 0 0 .78-.28l3.9-14.4a.5.5 0 0 0-.51-.71ZM8.2 12.7l10.6-6.6-8.8 8.2",
  // Handset in a conversation bubble.
  whatsapp: "M3.2 20.8 4.6 16.6A8.4 8.4 0 1 1 7.9 19.9L3.2 20.8ZM9.1 8.4c-.3 0-.6.1-.8.4-.3.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.7 2.8 4.3 3.8 2.1.8 2.6.7 3 .6.6-.1 1.6-.7 1.9-1.4.2-.7.2-1.2.1-1.4-.1-.1-.3-.2-.6-.4l-1.6-.8c-.2-.1-.4-.1-.6.1l-.7.9c-.1.2-.3.2-.6.1a6.9 6.9 0 0 1-3.3-2.9c-.1-.2 0-.4.1-.5l.5-.6c.1-.2.1-.3 0-.5l-.7-1.7c-.2-.4-.4-.4-.6-.4Z",
  // Envelope, with the flap as a separate stroke.
  email: "M2.8 6.6h18.4v10.8H2.8zM2.8 7l9.2 6.2L21.2 7",
  // A sheet with three ruled lines.
  brief: "M5.5 2.8h9l4.5 4.5v13.9h-13.5zM14.2 2.8v4.8h4.8M8.4 12.4h7.2M8.4 15.4h7.2M8.4 18.4h4.4",
};

export function ChannelIcon({
  id,
  className = "",
}: {
  id: IconId;
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={PATHS[id]} />
    </svg>
  );
}
