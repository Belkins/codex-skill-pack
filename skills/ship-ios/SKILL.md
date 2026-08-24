---
name: ship-ios
description: Build and prepare an iOS IPA for App Store Connect upload.
---

# /ship-ios — Build and Upload iOS IPA to App Store Connect

One-command skill that bumps the build number, builds a release IPA, and opens Transporter for upload.

## Usage

```
/ship-ios              # auto-bump build number, build, open Transporter
/ship-ios 35           # force specific build number
```

## Instructions

### Step 1 — Locate the Flutter project

Find the mobile app directory by locating `pubspec.yaml` in the current
directory or immediate subdirectories. Confirm the resolved project before
changing its version.

### Step 2 — Bump build number

1. Read `pubspec.yaml` and find the current `version:` line (format: `X.Y.Z+BUILD`)
2. If a build number was provided as argument, use that. Otherwise, increment the current build number by 1.
3. Edit `pubspec.yaml` with the new version string (keep the marketing version, only change build number)
4. Confirm the bump to the user: "Bumped to X.Y.Z+NEW"

### Step 3 — Build IPA

Run these sequentially:
```bash
cd <project-dir>
flutter clean
flutter pub get
cd ios && pod install && cd ..
flutter build ipa --release
```

Watch for:
- Build failures → report the error and stop
- Signing issues → check the team ID in Xcode project
- Pod install warnings about base configurations → safe to ignore (Flutter handles this)

### Step 4 — Open Transporter

```bash
open -a Transporter "<project-dir>/build/ios/ipa/*.ipa"
```

Tell the user: **Click "Deliver" in Transporter to upload to App Store Connect.**

### Step 4.5 — Write App Review Notes

Before submitting in ASC, write detailed App Review notes so the reviewer can reproduce key flows without guessing.

Draft notes covering:

**If app has IAP:**
- Confirm subscription products exist and have been tested in sandbox
- List product names and prices

**If app uses third-party AI / collects data:**
- Walk the reviewer through the consent flow step by step
- Name the exact screens, page numbers, and button text
- Example: "Page 4 of 6 in onboarding, titled 'How Your AI Tutor Works'"
- Mention where the privacy policy lives (URL)

**If app requires special testing:**
- Provide demo account credentials
- Explain how to reach key features (paywall, AI sessions, etc.)

Paste the notes into ASC → Version → App Review Information → Notes.

### Step 5 — Post-upload checklist

Print this checklist for the user:
```
Post-upload checklist:
1. Wait ~5-10 min for ASC to process the build
2. Go to ASC → Your App → App Store tab → select the new build
3. If responding to a rejection: reply in Resolution Center with change summary
4. Click "Submit for Review"
```

## Pre-submission Warning

Before submitting to App Store Review, **strongly recommend** running `/preflight-ios` first. This catches:
- **Inactive Paid Apps Agreement**
- RevenueCat offerings with empty packages
- ASC subscription status issues ("Developer Action Needed", "Rejected" localizations)
- Missing privacy disclosures in iOS permission strings
- Untested sandbox purchases

If IAP is broken, run `/diagnose-iap` for systematic config-before-code diagnosis.

Apple reviews on **iPad Air 11-inch (M3)** — always verify iPad layout.

## Notes

- No `.p8` API key on disk — do NOT attempt `xcrun altool`. Always use Transporter GUI.
- The IPA path is always `build/ios/ipa/<app_name>.ipa` after `flutter build ipa`
- CocoaPods "base configuration" warning is expected and harmless for Flutter projects
