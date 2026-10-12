import { NextResponse } from "next/server";
import { searchOfficialDocuments } from "@/lib/policy-search/search-official-documents";
import { parsePolicySearchBody } from "@/lib/policy-search/validate-input";

export const runtime = "nodejs";

/**
 * Zoekt openbare kandidaatdocumenten op vooraf geregistreerde
 * officiële verzekeraarsbronnen. Geen PDF-analyse, geen exacte match.
 * Bronfouten worden per zoekactie afgehandeld zonder andere merken te raken.
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

  try {
    const result = await searchOfficialDocuments(parsed.value);

    if (result.status === "not_implemented") {
      return NextResponse.json({
        status: "not_implemented" as const,
        candidates: [],
        message: result.message,
      });
    }

    if (result.status === "no_match") {
      return NextResponse.json({
        status: "no_match" as const,
        candidates: [],
        message: result.message,
      });
    }

    return NextResponse.json({
      status: "candidates_found" as const,
      candidates: result.candidates,
      message: result.message,
    });
  } catch {
    console.error("poliszoeken: onverwachte fout");
    return NextResponse.json(
      {
        error:
          "Er ging iets mis bij het zoeken. Zoek de juiste polisvoorwaarden in het interne systeem van DBA en upload deze.",
      },
      { status: 500 },
    );
  }
}
