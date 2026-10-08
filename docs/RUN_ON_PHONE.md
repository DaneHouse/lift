# Run LIFT on your iPhone from this Mac

This installs a development build on your own iPhone, signed with your personal Apple team (free). It does not go through TestFlight or the App Store.

## Before you start

- A Mac with Xcode installed (current version from the App Store). Open Xcode once and accept its license and install any components it asks for.
- Your iPhone, a USB cable, and the iPhone passcode.
- Your Apple ID (the one you use on the iPhone).
- The repo cloned at `~/Desktop/lift`, on `main`.
- Node and npm installed. Run `node -v` to check.

**Bundle ID is a placeholder.** `app.config.ts` sets `com.placeholder.lift`. SPEC gate G1 (name, bundle ID, icon) is still open. A personal team can usually sign a placeholder ID, but if Xcode reports the ID is unavailable or already in use, the bundle ID must change first. Do not change it on your own. Ask Kassra for the final ID, edit `bundleIdentifier` in `app.config.ts`, then delete `ios/` and run the steps again.

## 1. One-time iPhone setup

1. Connect the iPhone to the Mac with USB. Unlock it and tap **Trust** if asked.
2. On the iPhone: **Settings → Privacy & Security → Developer Mode**, turn it on, and restart when prompted. This option only appears after the phone has been connected to Xcode at least once. If you do not see it, connect the phone, open Xcode → Window → Devices and Simulators, then check again.
3. On the Mac, in Xcode: **Settings (Cmd+,) → Accounts → +** → sign in with your Apple ID. Your name should appear with a "Personal Team" entry.

## 2. Install JavaScript dependencies

```sh
cd ~/Desktop/lift
npm ci
```

Run `npm run verify` to confirm the checkout is healthy before building.

## 3. Generate the native iOS project

```sh
npx expo prebuild --platform ios
```

This creates `ios/` and runs `pod install` (CocoaPods), which produces `ios/LIFT.xcworkspace`. If CocoaPods is missing, install it (`brew install cocoapods`) and run the command again. The folder is gitignored, so nothing from it is committed. Adding `--no-install` skips CocoaPods, and then there is no `.xcworkspace` to open. Re-run this step after any change to `app.config.ts` or to a native plugin. Use `--clean` to regenerate from scratch.

## 4. Set signing in Xcode (once per `ios/` folder)

1. Open the workspace (`ios/LIFT.xcworkspace`; the name follows the app name in `app.config.ts`). Use the `.xcworkspace` file, not the `.xcodeproj`.
2. Select the **LIFT** project in the left panel, then the **LIFT** target.
3. Open **Signing & Capabilities**.
4. Check **Automatically manage signing**.
5. Under **Team**, choose your **Personal Team** (your name).
6. If Xcode shows a bundle ID error, see the bundle ID note above.

The team choice is stored in the generated project. Doing this once is enough until you run `prebuild --clean`.

## 5. Build and install on the phone

With the iPhone connected and unlocked:

```sh
npx expo run:ios --device
```

Pick your iPhone from the list when prompted. The command builds the app, installs it on the phone, and starts the Metro dev server. The first build takes several minutes.

If you prefer to build in Xcode, press the Run button with your iPhone chosen as the destination. The Metro server still needs to be running; start it with `npx expo start --dev-client`.

## 6. Trust the developer on the phone (first install only)

On the iPhone: **Settings → General → VPN & Device Management**, tap your Apple ID under *Developer App*, then tap **Trust**. Open LIFT from the home screen.

## 7. Every day after that

1. Keep the Mac and iPhone on the same Wi-Fi network, or keep the USB cable connected.
2. In the repo: `npx expo start --dev-client`.
3. Open LIFT on the phone. It connects to the running dev server. Edits reload on save.

## Things to know

- **Free personal-team builds expire after about 7 days.** When the app stops opening, run step 5 again. Reinstalling with the same bundle ID normally keeps the app's data, but do not rely on it: export first with **Settings → Import or export → Export all data** and keep the JSON. A changed bundle ID starts a new app with empty data.
- Apple allows a limited number of apps per free personal team. Remove old test builds from the phone if you hit that limit.
- The build and signing run locally on the Mac with Xcode. The dev server runs on the Mac and the phone connects to it.
- Keep the iOS signing team out of git. `ios/` is gitignored; do not commit `.env` files or certificates.

## Alternative: EAS development build

Use this only if the local build fails and you want a build made on Expo's servers.

Not set up yet. This repo has no `eas.json` and no EAS project link. Setting it up means:

1. `npx eas-cli login` with an Expo account.
2. `npx eas-cli build:configure` (creates `eas.json` and an EAS project ID). Review the file, then commit it.
3. Register the iPhone with `npx eas-cli device:create`. This needs a paid Apple Developer Program membership. Enrolling is Kassra's decision.
4. `npx eas-cli build --profile development --platform ios`, then install the build from the link EAS prints.

EAS uploads the project to Expo's servers. That is an outbound step, so Kassra approves it first.

## Troubleshooting

| Symptom | Fix |
|---|---|
| "No device found" | Unlock the phone, tap Trust, confirm the cable. Check Developer Mode. |
| "Developer Mode disabled" | Settings → Privacy & Security → Developer Mode, then restart. |
| "Unable to install" / signing error | Step 4: pick the Personal Team. Check the bundle ID. |
| "Untrusted Developer" on launch | Step 6. |
| App opens but says it cannot connect to Metro | Start `npx expo start --dev-client`; both devices on the same Wi-Fi. |
| Build fails after an Expo or Xcode update | `npx expo prebuild --platform ios --clean`, then redo step 4. |
