import { NextResponse } from "next/server";
import { searchOfficialDocuments } from "@/lib/policy-search/search-official-documents";
import { parsePolicySearchBody } from "@/lib/policy-search/validate-input";

export const runtime = "nodejs";

/**
 * Zoekt openbare kandidaatdocumenten op vooraf geregistreerde
 * officiële verzekeraarsbronnen. Geen PDF-analyse, geen exacte match.
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

    return NextResponse.json({
      status: result.status,
      candidates: result.candidates,
      message: result.message,
    });
  } catch {
    console.error("poliszoeken: onverwachte fout");
    return NextResponse.json(
      {
        error:
          "Er ging iets mis bij het zoeken. Zoek de toepasselijke voorwaarden in het interne systeem van DBA en upload deze handmatig.",
      },
      { status: 500 },
    );
  }
}
