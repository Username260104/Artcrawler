export async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "accept": "text/html,application/xhtml+xml",
      "user-agent":
        "Artcrawler/0.1 (+https://example.com; exhibition calendar crawler)"
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

export async function postJson<TResponse>(
  url: string,
  body: Record<string, unknown>
): Promise<TResponse> {
  const response = await fetch(url, {
    body: JSON.stringify(body),
    headers: {
      "accept": "application/json",
      "content-type": "application/json",
      "user-agent":
        "Artcrawler/0.1 (+https://example.com; exhibition calendar crawler)"
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<TResponse>;
}

export function toAbsoluteUrl(baseUrl: string, href: string | undefined): string | undefined {
  if (!href) {
    return undefined;
  }

  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return undefined;
  }
}
