import { Router, type IRouter } from "express";
import https from "https";
import http from "http";
import { URL } from "url";

const router: IRouter = Router();

const INSECURE_AGENT = new https.Agent({ rejectUnauthorized: false });

const NAVIGATION_INTERCEPTOR = `
<script id="__proxy_interceptor__">
(function() {
  var BASE_PROXY = '/api/browse?url=';

  function toProxyHref(href) {
    if (!href) return href;
    try {
      var url = new URL(href, window.location.href);
      if (url.protocol === 'javascript:' || url.protocol === 'mailto:' || url.protocol === 'tel:') return href;
      return BASE_PROXY + encodeURIComponent(url.href);
    } catch(e) { return href; }
  }

  // Intercept all link clicks
  document.addEventListener('click', function(e) {
    var el = e.target;
    while (el && el.tagName !== 'A') el = el.parentElement;
    if (!el || !el.href) return;
    if (el.protocol === 'javascript:' || el.protocol === 'mailto:' || el.protocol === 'tel:') return;
    e.preventDefault();
    e.stopPropagation();
    window.location.href = toProxyHref(el.href);
  }, true);

  // Override window.open to stay in frame
  window.open = function(url) {
    if (url) window.location.href = toProxyHref(String(url));
    return window;
  };

  // Rewrite existing links
  function rewriteAll() {
    var links = document.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute('href');
      if (!href || href.startsWith('/api/browse') || href.startsWith('javascript:') ||
          href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) continue;
      try {
        var u = new URL(href, window.location.href);
        links[i].setAttribute('href', BASE_PROXY + encodeURIComponent(u.href));
      } catch(e) {}
    }
    var forms = document.querySelectorAll('form[action]');
    for (var j = 0; j < forms.length; j++) {
      var action = forms[j].getAttribute('action');
      if (!action || action.startsWith('/api/browse') || action.startsWith('javascript:')) continue;
      try {
        var au = new URL(action, window.location.href);
        forms[j].setAttribute('action', BASE_PROXY + encodeURIComponent(au.href));
      } catch(e) {}
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', rewriteAll);
  } else {
    rewriteAll();
  }

  // Watch for dynamically added links
  var observer = new MutationObserver(function(mutations) {
    for (var i = 0; i < mutations.length; i++) {
      var added = mutations[i].addedNodes;
      for (var j = 0; j < added.length; j++) {
        if (!added[j].querySelectorAll) continue;
        var links = added[j].querySelectorAll('a[href]');
        for (var k = 0; k < links.length; k++) {
          var href = links[k].getAttribute('href');
          if (!href || href.startsWith('/api/browse') || href.startsWith('javascript:') ||
              href.startsWith('mailto:') || href.startsWith('#')) continue;
          try {
            var u = new URL(href, window.location.href);
            links[k].setAttribute('href', BASE_PROXY + encodeURIComponent(u.href));
          } catch(e) {}
        }
      }
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
</script>
`;

interface FetchResult {
  statusCode: number;
  contentType: string;
  buffer: Buffer;
  finalUrl: string;
}

function fetchWithRedirects(rawUrl: string, maxRedirects = 5): Promise<FetchResult> {
  return new Promise((resolve, reject) => {
    function doRequest(urlStr: string, redirectsLeft: number) {
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(urlStr);
      } catch (e) {
        reject(e);
        return;
      }

      const isHttps = parsedUrl.protocol === "https:";
      const lib = isHttps ? https : http;
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "identity",
        },
        ...(isHttps ? { agent: INSECURE_AGENT } : {}),
      };

      const req = lib.request(options, (res) => {
        const status = res.statusCode || 200;

        // Follow redirects
        if ([301, 302, 303, 307, 308].includes(status) && res.headers.location && redirectsLeft > 0) {
          const redirectUrl = new URL(res.headers.location, urlStr).href;
          res.resume(); // consume and discard body
          doRequest(redirectUrl, redirectsLeft - 1);
          return;
        }

        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => {
          resolve({
            statusCode: status,
            contentType: res.headers["content-type"] || "text/html",
            buffer: Buffer.concat(chunks),
            finalUrl: urlStr,
          });
        });
        res.on("error", reject);
      });

      req.on("error", reject);
      req.setTimeout(15000, () => {
        req.destroy(new Error("Request timed out"));
      });
      req.end();
    }

    doRequest(rawUrl, maxRedirects);
  });
}

router.get("/browse", async (req, res) => {
  const urlParam = req.query.url;

  if (!urlParam || typeof urlParam !== "string") {
    res.status(400).send("<html><body><p>Missing <code>url</code> parameter.</p></body></html>");
    return;
  }

  let targetUrl: string;
  try {
    const raw = urlParam.trim();
    const withProto = raw.startsWith("http") ? raw : `https://${raw}`;
    new URL(withProto); // validate
    targetUrl = withProto;
  } catch {
    res.status(400).send("<html><body><p>Invalid URL.</p></body></html>");
    return;
  }

  try {
    const result = await fetchWithRedirects(targetUrl);
    const contentType = result.contentType;

    // Strip security headers from our response
    res.removeHeader("X-Frame-Options");
    res.removeHeader("Content-Security-Policy");

    // For non-HTML content, pass through directly
    if (!contentType.includes("text/html")) {
      res.setHeader("Content-Type", contentType);
      res.send(result.buffer);
      return;
    }

    let html = result.buffer.toString("utf-8");

    // Determine base origin from final URL after redirects
    const finalParsed = new URL(result.finalUrl);
    const baseOrigin = `${finalParsed.protocol}//${finalParsed.host}`;

    // Inject base tag + interceptor right inside <head>
    const injection = `<base href="${baseOrigin}/">${NAVIGATION_INTERCEPTOR}`;
    if (/<head(\s[^>]*)?>/i.test(html)) {
      html = html.replace(/<head(\s[^>]*)?>/i, (m) => m + injection);
    } else {
      html = injection + html;
    }

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (err) {
    req.log.error({ err }, "Browse proxy error");
    const msg = (err as Error).message;
    res.status(502).send(
      `<html><body style="font-family:sans-serif;padding:2rem;color:#333"><h2 style="color:#c00">Could not load page</h2><p>${msg}</p><p style="color:#888;font-size:14px">Some sites block proxy access. Try a different site.</p></body></html>`
    );
  }
});

export default router;
