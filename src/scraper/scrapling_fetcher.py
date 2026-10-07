import json
import os
import sys
import time

try:
    from scrapling.fetchers import FetcherSession
except ImportError as exc:
    print(
        "Scrapling is not installed. Run: python -m pip install -r requirements.txt",
        file=sys.stderr,
    )
    raise SystemExit(1) from exc


def read_positive_int(name, fallback):
    try:
        value = int(os.getenv(name, fallback))
        return value if value > 0 else fallback
    except ValueError:
        return fallback


def decode_body(page):
    body = page.body
    if isinstance(body, bytes):
        encoding = getattr(page, "encoding", None) or "utf-8"
        return body.decode(encoding, errors="replace")
    return str(body)


def fetch_urls(urls):
    timeout = read_positive_int("SCRAPLING_TIMEOUT_SECONDS", 45)
    retries = read_positive_int("SCRAPLING_RETRIES", 2)
    delay_ms = read_positive_int("SCRAPLING_DELAY_MS", 700)
    results = []
    errors = []

    headers = {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
    }

    session = FetcherSession(
        impersonate="chrome",
        stealthy_headers=True,
        timeout=timeout,
        retries=retries,
        retry_delay=2,
        follow_redirects=True,
        max_redirects=10,
        headers=headers,
    )

    with session as client:
        for index, url in enumerate(urls):
            if index > 0:
                time.sleep(delay_ms / 1000)

            try:
                print(f"Scrapling fetching: {url}", file=sys.stderr)
                page = client.get(url)
                status = int(getattr(page, "status", 0) or 0)

                if status >= 400:
                    raise RuntimeError(f"HTTP {status}")

                html = decode_body(page)
                results.append({
                    "url": url,
                    "html": html,
                })
                print(f"Scrapling fetched: {url} ({len(html)} bytes)", file=sys.stderr)
            except Exception as exc:
                errors.append({
                    "url": url,
                    "error": str(exc),
                })

    return {
        "results": results,
        "errors": errors,
    }


def main():
    urls = sys.argv[1:]
    if not urls:
        print(json.dumps({"results": [], "errors": []}))
        return

    print(json.dumps(fetch_urls(urls), ensure_ascii=True))


if __name__ == "__main__":
    main()
