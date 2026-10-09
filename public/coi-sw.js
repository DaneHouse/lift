// Adds the cross-origin isolation headers SQLite on the web needs (SharedArrayBuffer).
// Lets LIFT run from any plain static file server that cannot set response headers.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') return;
  event.respondWith(
    fetch(request)
      // Single-page app: a plain static server 404s on deep links such as /history. Serve the shell.
      .then((response) =>
        response.status === 404 && request.mode === 'navigate' ? fetch('/index.html') : response,
      )
      .then((response) => {
        if (response.status === 0) return response;
        const headers = new Headers(response.headers);
        headers.set('Cross-Origin-Opener-Policy', 'same-origin');
        headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
        headers.set('Cross-Origin-Resource-Policy', 'same-origin');
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      }),
  );
});
