import { NextResponse } from "next/server";

import { CHANNELS, FOUNDER_EMAIL } from "@/lib/channels";

/**
 * Brief delivery.
 *
 * Resend over raw SMTP because Vercel's serverless runtime has no outbound
 * SMTP, and over a client-side form service because the API key must never
 * reach the browser.
 *
 * Required env (see README):
 *   RESEND_API_KEY   — from resend.com/api-keys
 * Optional env:
 *   RESEND_FROM      — a verified sender. Defaults to Resend's shared
 *                      onboarding sender, which only delivers to the
 *                      account owner's own address. That is enough here,
 *                      since the only recipient is the founder.
 *   CONTACT_TO       — override the destination address.
 *
 * Called with fetch() from a client component, so there is no `<form action>`
 * and no server-action serialisation to get wrong.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const MAX_FIELD = 4000;

interface Payload {
  name?: unknown;
  channel?: unknown;
  handle?: unknown;
  need?: unknown;
  company?: unknown;
  locale?: unknown;
}

/** Trim, cap length, and strip characters that could forge a header. */
function clean(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\r\n]+/g, " ").trim().slice(0, MAX_FIELD);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "Malformed request" }, { status: 400 });
  }

  // Honeypot. Answer 200 so a bot has nothing to learn from the response.
  if (clean(body.company).length > 0) {
    return NextResponse.json({ ok: true });
  }

  const name = clean(body.name);
  const handle = clean(body.handle);
  const need = clean(body.need);
  const locale = clean(body.locale) === "ru" ? "ru" : "en";

  const channelId = clean(body.channel);
  const channel = CHANNELS.find((c) => c.id === channelId);

  if (name.length === 0 || handle.length === 0 || need.length < 12 || !channel) {
    return NextResponse.json({ error: "Missing fields" }, { status: 422 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Loud in the server log, quiet to the client — the form falls back to
    // showing the direct address, which still gets the brief delivered.
    console.error("[contact] RESEND_API_KEY is not set; brief was not sent.");
    return NextResponse.json({ error: "Mail is not configured" }, { status: 503 });
  }

  const rows: [string, string][] = [
    ["Name", name],
    ["Reply on", `${channel.id} — ${handle}`],
    ["Locale", locale],
  ];

  const html = `
    <div style="font-family:ui-sans-serif,system-ui,sans-serif;line-height:1.6;color:#111">
      <h2 style="margin:0 0 16px;font-size:18px">New brief from the North Studio site</h2>
      <table style="border-collapse:collapse;margin-bottom:20px">
        ${rows
          .map(
            ([label, value]) =>
              `<tr><td style="padding:4px 16px 4px 0;color:#666">${label}</td><td style="padding:4px 0"><strong>${escapeHtml(value)}</strong></td></tr>`,
          )
          .join("")}
      </table>
      <p style="margin:0 0 6px;color:#666">What they need</p>
      <p style="margin:0;white-space:pre-wrap">${escapeHtml(need)}</p>
    </div>
  `;

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM ?? "North Studio <onboarding@resend.dev>",
        to: [process.env.CONTACT_TO ?? FOUNDER_EMAIL],
        // So hitting reply in the mail client goes to the sender, not to Resend.
        reply_to: channel.id === "email" ? handle : undefined,
        subject: `Brief — ${name}`,
        html,
      }),
    });

    if (!response.ok) {
      console.error("[contact] Resend rejected the send:", await response.text());
      return NextResponse.json({ error: "Send failed" }, { status: 502 });
    }
  } catch (error) {
    console.error("[contact] Could not reach Resend:", error);
    return NextResponse.json({ error: "Send failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
