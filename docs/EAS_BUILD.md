# Build LIFT with EAS (cloud builds)

Builds run on Expo's servers, so the Mac needs no Xcode and no free disk for a native build. `eas.json` is already in the repo. Run every command below from the repo root.

**Outbound steps need Kassra.** `eas build` uploads the project to Expo and signs with Apple credentials. `eas submit` would send a build to App Store Connect and is deliberately not configured (`"submit": {}`). Do not run it. SPEC gate G7 is Kassra's.

## What you need first

1. An Expo account (free): https://expo.dev/signup.
2. A paid **Apple Developer Program** membership. Device builds cannot be signed without it. The free personal team only works with local Xcode builds (`docs/RUN_ON_PHONE.md`).
3. Node and npm. Check with `node -v`. Run `npm ci` once.
4. The bundle ID is still the placeholder `com.placeholder.lift` (gate G1). The first signed build registers that ID with Apple. Decide the final ID first if possible. Changing it later means a new app with empty data.

## Profiles in `eas.json`

| Profile       | Purpose                                                              | Distribution                       |
| ------------- | -------------------------------------------------------------------- | ---------------------------------- |
| `development` | Dev client for your own phone. Connects to `npx expo start`.         | Internal (ad hoc)                  |
| `preview`     | Release-style build without the dev client, for gym testing.         | Internal (ad hoc)                  |
| `production`  | App Store build. Build number goes up by one on every build (remote) | Store (TestFlight/App Store later) |

## One-time setup

```sh
npx eas-cli login
npx eas-cli init
```

`eas init` links the repo to an Expo project and adds a `projectId` to the config. It asks to create the project on your Expo account. Review the change, then commit it.

## Register your iPhone (development and preview builds)

```sh
npx eas-cli device:create
```

Choose **Website**, scan the QR code with the iPhone camera and install the profile it offers. Then, on the iPhone, open **Settings → General → VPN & Device Management** and install the downloaded profile. Turn on **Settings → Privacy & Security → Developer Mode** and restart the phone. Add each friend's phone the same way before building for them. A new device needs a new build.

## Build the development client

```sh
npx eas-cli build --profile development --platform ios
```

EAS asks to sign in to Apple and to generate credentials. Say yes. When the build finishes it prints a link and a QR code. Open the link on the iPhone and tap Install.

## Daily use

```sh
npx expo start --dev-client
```

Open LIFT on the phone. It connects to the dev server on the same Wi-Fi. JavaScript changes reload without a new build. Only native changes (new native module, plugin or `app.config.ts` edit) need a new `eas build`.

## Other builds

```sh
npx eas-cli build --profile preview --platform ios
npx eas-cli build --profile production --platform ios
```

`production` produces a store build. It is only uploaded to TestFlight or the App Store by `eas submit`, which Kassra runs.

## Useful commands

```sh
npx eas-cli build:list            # recent builds and their install links
npx eas-cli device:list           # registered devices
npx eas-cli credentials           # view or remove signing credentials
```

## Troubleshooting

| Symptom                                   | Fix                                                                                 |
| ----------------------------------------- | ----------------------------------------------------------------------------------- |
| "Device not registered" on install        | Run `device:create` for that phone, then build again.                               |
| Build fails at "Install dependencies"     | Run `npm run verify` locally. `.npmrc` sets `legacy-peer-deps`; keep it committed.  |
| "Bundle identifier is not available"      | Someone already owns `com.placeholder.lift`. Ask Kassra for the final ID (gate G1). |
| App opens but cannot reach the dev server | Phone and Mac on the same Wi-Fi, `npx expo start --dev-client` running.             |
| Need to start over on credentials         | `npx eas-cli credentials`, remove the old profile, rebuild.                         |
