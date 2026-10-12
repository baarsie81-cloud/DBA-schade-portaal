import { NextResponse } from "next/server";
import { buildPolicySearchQueries } from "@/lib/policy-search/build-queries";
import { parsePolicySearchBody } from "@/lib/policy-search/validate-input";

export const runtime = "nodejs";

/**
 * Placeholder voor het zoeken op officiële verzekeraarswebsites.
 * Geen externe zoek-API in MVP 0.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Ongeldige zoekaanvraag." },
      { status: 400 },
    );
  }

  const parsed = parsePolicySearchBody(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  // Queries worden al opgebouwd zodat de volgende zoekstap hierop kan voortbouwen.
  buildPolicySearchQueries(parsed.value);

  return NextResponse.json({
    status: "setup_pending" as const,
    candidates: [],
    message:
      "Automatisch zoeken op officiële verzekeraarswebsites wordt momenteel ingericht.",
  });
}
