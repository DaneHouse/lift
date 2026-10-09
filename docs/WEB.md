# LIFT as a web app (iPhone Safari)

The app also builds as a web app. The build output is committed in `web/` so a machine with no Node or npm can serve it as plain static files.

## Rebuild (on a dev machine)

```sh
npm ci
npm run build:web     # writes web/ (index.html patched for the PWA, assets, wasm)
git add web && git commit
```

## Serve

Serve the contents of `web/` at the root of an origin (not a sub-folder). It must be HTTPS, or `localhost`: SQLite on the web and the service worker need a secure context. Any static server works. Examples:

```sh
python3 -m http.server 8090 --directory web     # no install needed
node web/serve.mjs 8090                          # same, plus COOP/COEP headers
npm run serve:web                                # in the repo, same as the node line
```

## How SQLite works on the web

expo-sqlite on the web uses a wasm SQLite in a worker, which needs `SharedArrayBuffer`, which needs cross-origin isolation (COOP and COEP headers). A plain static server does not send them. `web/coi-sw.js` is a small service worker that adds them. On the first visit the page registers it and reloads once. The same worker serves `index.html` for deep links such as `/history`, which a plain static server would 404.

If your server sends `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` itself, the worker does nothing.

## On the iPhone

Open the HTTPS address in Safari, tap Share, then Add to Home Screen. It opens full screen with no browser bar. Data is stored on that device in the browser's private file storage. Safari can clear site data it has not seen for a while, so export your data from Settings, Import or export, now and then. Installing to the Home Screen makes Safari treat it as an app and is the best protection.

## Native-only features

Haptics and keep-awake run through Expo's web versions, with no errors. Progress photos and everything planned for P3 (Live Activity, HealthKit, music ducking) are native only and are not part of the web build.
