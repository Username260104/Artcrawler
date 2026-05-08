export async function fetchHtml(url: string): Promise<string> {
  const response = await fetchWithContext(url, {
    headers: {
      ...browserLikeHeaders,
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
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
  const response = await fetchWithContext(url, {
    body: JSON.stringify(body),
    headers: {
      ...browserLikeHeaders,
      "accept": "application/json",
      "content-type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<TResponse>;
}

export async function postFormJson<TResponse>(
  url: string,
  body: Record<string, string>,
  options: {
    referer?: string;
  } = {}
): Promise<TResponse> {
  const response = await fetchWithContext(url, {
    body: new URLSearchParams(body).toString(),
    headers: {
      ...browserLikeHeaders,
      "accept": "application/json, text/javascript, */*; q=0.01",
      "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
      ...(options.referer ? { "referer": options.referer } : {}),
      "x-requested-with": "XMLHttpRequest"
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

const browserLikeHeaders = {
  "accept-language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
};

async function fetchWithContext(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    throw new Error(`Failed to fetch ${url}: ${message}`);
  }
}
