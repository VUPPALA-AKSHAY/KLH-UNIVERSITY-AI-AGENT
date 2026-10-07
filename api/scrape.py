"""Standalone Scrapling HTTP service.

Runs Scrapling (Python) so environments without a Python runtime - such as
Vercel's Node serverless functions - can still fetch pages with Scrapling.

POST /
  {"urls": ["https://..."]}
->
  {"results": [{"url": "...", "html": "..."}], "errors": [{"url": "...", "error": "..."}]}
"""

import os
import sys

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

TIMEOUT_MS = int(os.getenv("SCRAPLING_TIMEOUT_MS", "45000"))
RETRIES = int(os.getenv("SCRAPLING_RETRIES", "2"))
MAX_URLS = int(os.getenv("SCRAPLING_MAX_URLS", "8"))
MAX_HTML_BYTES = int(os.getenv("SCRAPLING_MAX_HTML_BYTES", str(4 * 1024 * 1024)))

try:
    from scrapling.fetchers import FetcherSession
except ImportError:  # pragma: no cover - startup guard
    print(
        "Scrapling is not installed. Run: pip install -r requirements.txt",
        file=sys.stderr,
    )
    raise


def decode_body(page) -> str:
    body = page.body
    if isinstance(body, bytes):
        encoding = getattr(page, "encoding", None) or "utf-8"
        return body.decode(encoding, errors="replace")
    return str(body)


def scrape(urls):
    results = []
    errors = []

    with FetcherSession(timeout=TIMEOUT_MS, stealthy_headers=True, follow_redirects=True) as session:
        for url in urls:
            for attempt in range(RETRIES + 1):
                try:
                    page = session.get(url)
                    status = getattr(page, "status", 200)
                    if status and int(status) >= 400:
                        raise RuntimeError(f"HTTP {status}")

                    html = decode_body(page)
                    results.append({"url": url, "html": html[:MAX_HTML_BYTES]})
                    print(f"fetched {url} ({len(html)} bytes)", flush=True)
                    break
                except Exception as exc:  # noqa: BLE001
                    if attempt >= RETRIES:
                        errors.append({"url": url, "error": str(exc)})
                        print(f"failed {url}: {exc}", flush=True)
                    else:
                        print(f"retry {attempt + 1} for {url}: {exc}", flush=True)

    return results, errors


@app.get("/health")
def health():
    return {"ok": True, "service": "scrapling-scraper", "timeout_ms": TIMEOUT_MS}


@app.post("/")
async def handle(request: Request):
    try:
        body = await request.json()
    except Exception:  # noqa: BLE001
        body = {}

    urls = [u for u in (body.get("urls") or []) if isinstance(u, str) and u.strip()]
    urls = urls[:MAX_URLS]

    if not urls:
        return JSONResponse({"results": [], "errors": []})

    results, errors = scrape(urls)
    return JSONResponse({"results": results, "errors": errors})