---
name: preflight-ios
description: Run a pre-submission App Store Review checklist for iOS apps.
---

# /preflight-ios — Pre-Submission Checklist for App Store Review

Run this BEFORE submitting any iOS build to App Store Connect. Catches the config issues that cause Apple rejections.

## Usage

```
/preflight-ios
```

## Instructions

Walk through each section with the user **in order**. Request screenshots for any third-party dashboard checks — don't trust verbal "yes it's configured" answers.

### 0. Paid Apps Agreement & Business Config (CHECK FIRST)

This is the #1 root cause of IAP rejections — check BEFORE anything else.

Ask the user to open ASC → Business and share a screenshot:

- [ ] **Paid Apps Agreement**: Status = **Active** (not "Pending User Info", "Expired", or "Pending")
- [ ] **Bank Account**: At least one bank account added with Status = **Active**
- [ ] **Tax Forms**: All required forms show **Active** or **Complete**
- [ ] **Developer Program License Agreement**: Accepted (no banner asking Account Holder to review)

**If Paid Apps Agreement is NOT Active, STOP.** Nothing else matters — all StoreKit product fetches will fail silently. Fix the agreement first, then wait for propagation (can take hours).

### 1. RevenueCat Verification (if app has IAP)

Ask the user to open https://app.revenuecat.com and share screenshots of:

- [ ] **Offerings → default**: Verify a "default" offering exists
- [ ] **Packages**: Each package (`$rc_monthly`, `$rc_annual`, etc.) has a **product attached** (not "No products are attached to this package")
- [ ] **Products tab**: All products show green/connected status
- [ ] **API Key**: Matches what's in the app's `.env` file
- [ ] **App Store Shared Secret**: Entered in App Settings → iOS App

**This is the #1 cause of IAP rejections.** RevenueCat offerings can exist with empty packages — verify products are ATTACHED.

### 2. App Store Connect Verification

Ask the user to check in ASC:

- [ ] **Paid Apps Agreement**: Business → Agreements → "Paid Apps" is Active (not expired/pending)
- [ ] **Banking & Tax**: Fully completed for all territories
- [ ] **Subscription Status**: Each subscription shows "Ready to Submit" or "Prepare for Submission" (not "Developer Action Needed" or "Rejected")
- [ ] **Subscription Localizations**: Not "Rejected" — click into each and re-save if needed
- [ ] **Review Screenshots**: Each subscription has a review screenshot uploaded
- [ ] **Review Notes**: Each subscription has review notes explaining how to test
- [ ] **Version Page**: Subscriptions are attached to the current app version under "In-App Purchases and Subscriptions"
- [ ] **If IAP section doesn't appear on version page**: Use subscriptionSubmissions API as workaround + add detailed review notes explaining the IAP setup. This workaround was confirmed working Apr 2026.

### 2.5 App Review Notes Check

App Review notes are the #1 factor in passing review (confirmed after 7+ rejections, Apr 2026). Check ASC → Version → App Review Information → Notes.

- [ ] **Notes are NOT empty** — empty notes is the most common oversight
- [ ] **If IAP**: Notes confirm subscription products exist and work in sandbox
- [ ] **If AI/third-party data**: Notes walk reviewer through consent flow (screen names, page numbers, exact text)
- [ ] **If special testing needed**: Demo account credentials provided
- [ ] **Notes are >100 characters** — one-liners get ignored; detailed notes prevent false rejections

**If notes are empty or short, STOP and write them before submitting.** See `/ship-ios` Step 4.5 for a template.

### 3. Privacy Compliance (if app uses third-party AI)

- [ ] **NSMicrophoneUsageDescription** (Info.plist): Names the third-party AI service (e.g., "Google Gemini")
- [ ] **NSSpeechRecognitionUsageDescription** (Info.plist): Accurate about what processes speech
- [ ] **In-app consent dialog**: Exists and is mandatory before first AI interaction
- [ ] **Settings consent revocation**: User can revoke AI data consent
- [ ] **Privacy policy**: Accessible at the linked URL, mentions the AI service by name
- [ ] **App Review Notes**: Explains the AI consent flow and where to find it

### 4. Physical Device Sandbox Test

**Do NOT skip this.** Apple reviews on physical iPad. You must verify on a physical device.

- [ ] Create a sandbox tester in ASC (Users and Access → Sandbox → Testers)
- [ ] Install the build on a physical device (TestFlight or direct)
- [ ] Open the paywall
- [ ] Verify real prices load (not hardcoded fallback prices)
- [ ] Tap "Start Pro" → StoreKit purchase sheet appears
- [ ] Complete the sandbox purchase successfully

### 5. iPad Layout Check

Apple reviews on iPad Air 11-inch. Verify:

- [ ] Paywall renders correctly on iPad (not stretched edge-to-edge)
- [ ] Buttons are tappable and not in system gesture zones
- [ ] App works in both portrait and landscape (if iPad orientations are enabled)

### 6. Green Light

Only after ALL checks pass:
```
/ship-ios
```

## Notes

- Apple consistently reviews on **iPad Air 11-inch (M3)** — always test iPad layout
- Subscription products need **24-48 hours** to propagate in sandbox after creation/modification
- RevenueCat config changes take effect **immediately** — no propagation delay
