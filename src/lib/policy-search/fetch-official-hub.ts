import { isAllowedSourceHostname } from "@/lib/policy-search/official-sources";

const FETCH_TIMEOUT_MS = 8_000;
const MAX_HTML_BYTES = 1_500_000;
const MAX_REDIRECTS = 3;

export class OfficialHubFetchError extends Error {
  status: number;

  constructor(message: string, status = 502) {
    super(message);
    this.name = "OfficialHubFetchError";
    this.status = status;
  }
}

function assertAllowedHttpsUrl(urlString: string): URL {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    throw new OfficialHubFetchError("Ongeldige bron-URL geconfigureerd.", 500);
  }

  if (url.protocol !== "https:") {
    throw new OfficialHubFetchError(
      "Alleen HTTPS-bronnen zijn toegestaan.",
      500,
    );
  }

  if (!isAllowedSourceHostname(url.hostname)) {
    throw new OfficialHubFetchError(
      "De bron hoort niet tot de toegestane officiële domeinen.",
      500,
    );
  }

  return url;
}

/**
 * Haalt HTML op van een vooraf geregistreerde officiële hubpagina.
 * Redirects alleen naar allowlisted HTTPS-domeinen.
 */
export async function fetchOfficialHubHtml(
  pageUrl: string,
): Promise<{ html: string; finalUrl: string }> {
  let current = assertAllowedHttpsUrl(pageUrl).toString();

  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(current, {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        headers: {
          Accept: "text/html,application/xhtml+xml",
          "User-Agent": "DBA-SchadeAssistent/0.1 (official-source lookup)",
        },
        cache: "no-store",
      });

      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");
        if (!location) {
          throw new OfficialHubFetchError(
            "De officiële website gaf een ongeldige redirect.",
            502,
          );
        }
        current = assertAllowedHttpsUrl(
          new URL(location, current).toString(),
        ).toString();
        continue;
      }

      if (!response.ok) {
        throw new OfficialHubFetchError(
          "De officiële polisvoorwaardenpagina kon niet worden opgehaald.",
          502,
        );
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (
        contentType &&
        !contentType.includes("text/html") &&
        !contentType.includes("application/xhtml+xml")
      ) {
        throw new OfficialHubFetchError(
          "De officiële bron gaf geen HTML-pagina terug.",
          502,
        );
      }

      const buffer = await response.arrayBuffer();
      if (buffer.byteLength > MAX_HTML_BYTES) {
        throw new OfficialHubFetchError(
          "De officiële pagina is te groot om veilig te verwerken.",
          502,
        );
      }

      const html = new TextDecoder("utf-8").decode(buffer);
      return { html, finalUrl: current };
    } catch (error) {
      if (error instanceof OfficialHubFetchError) throw error;
      if (error instanceof Error && error.name === "AbortError") {
        throw new OfficialHubFetchError(
          "Het ophalen van de officiële pagina duurde te lang.",
          504,
        );
      }
      throw new OfficialHubFetchError(
        "De officiële website is momenteel niet bereikbaar.",
        502,
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new OfficialHubFetchError(
    "Te veel redirects vanaf de officiële bronpagina.",
    502,
  );
}
