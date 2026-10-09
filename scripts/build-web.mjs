// Builds the web app into web/ (committed, so a machine with no npm can serve it as static files).
//   npm run build:web
import { spawnSync } from 'node:child_process';
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const out = resolve('web');
rmSync(out, { recursive: true, force: true });
const run = spawnSync('npx', ['expo', 'export', '--platform', 'web', '--output-dir', out], {
  stdio: 'inherit',
});
if (run.status !== 0) process.exit(run.status ?? 1);

const head = `
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <link rel="manifest" href="/manifest.webmanifest" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="icon" type="image/png" href="/icon-192.png" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-title" content="LIFT" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <script>
      // SQLite on the web needs cross-origin isolation. If the server did not send the headers,
      // a service worker adds them and the page reloads once. Needs HTTPS or localhost.
      if (!window.crossOriginIsolated && 'serviceWorker' in navigator && window.isSecureContext) {
        navigator.serviceWorker.register('/coi-sw.js').then(function (registration) {
          if (!navigator.serviceWorker.controller) {
            var reload = function () { window.location.reload(); };
            if (registration.active) reload();
            else navigator.serviceWorker.addEventListener('controllerchange', reload);
          }
        });
      }
    </script>`;

const indexPath = resolve(out, 'index.html');
const html = readFileSync(indexPath, 'utf8')
  .replace(/<meta name="viewport"[^>]*>/, '')
  .replace('</head>', `${head}\n  </head>`);
writeFileSync(indexPath, html);
console.log('web/ ready: index.html patched for PWA and cross-origin isolation');
