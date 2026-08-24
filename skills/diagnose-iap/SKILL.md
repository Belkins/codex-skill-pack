---
name: diagnose-iap
description: Diagnose in-app purchase failures by checking App Store Connect and RevenueCat configuration before code.
---

# /diagnose-iap — IAP Debugging Checklist

Systematic diagnosis of In-App Purchase failures. Checks config before code — the IAP chain has 6 links that must all be connected.

## Usage

```
/diagnose-iap           # full diagnostic walkthrough
```

## Instructions

### Principle: Config Before Code

When IAP fails, the cause is almost always configuration — not code. Walk through these checks IN ORDER. Do not look at code until all 6 config checks pass.

### Step 1: Paid Apps Agreement (ASC → Business → Agreements)

Ask the user to screenshot ASC → Business page.

- [ ] **Paid Apps Agreement** = **Active** (not "Pending User Info", "Expired")
- [ ] **Bank Account** added with Status = **Active**
- [ ] **Tax Forms** = Active or Complete
- [ ] **Developer Program License Agreement** = Accepted (no update banner)

**If Paid Apps Agreement is NOT Active → STOP.** This is the root cause. All StoreKit fetches fail silently without an active agreement. Fix it and wait for propagation (can take hours).

### Step 2: ASC Subscription Products (ASC → Subscriptions)

Ask the user to screenshot each subscription product.

- [ ] Each product status = "Ready to Submit" or "Approved" (not "Developer Action Needed", "Missing Metadata", "Rejected")
- [ ] Each product has **Display Name** and **Description** filled
- [ ] Each localization is NOT "Rejected" — if so, click in and re-save
- [ ] Prices are set correctly

**If any product shows "Developer Action Needed"** → click in, fix missing fields, re-save.

### Step 3: RevenueCat Offerings (app.revenuecat.com)

Ask the user to screenshot the Offerings tab → default offering.

- [ ] A **"default"** offering exists
- [ ] `$rc_monthly` package has a product **ATTACHED** (not "No products are attached to this package")
- [ ] `$rc_annual` package has a product **ATTACHED**
- [ ] Products tab shows both products as green/connected
- [ ] API key matches the app's `.env` file
- [ ] App Store Shared Secret is entered (App Settings → iOS App)

**If packages show "No products attached" → THIS is the root cause.** Attach the products. No code change needed.

### Step 4: Product IDs Match

Verify product IDs are identical across all 3 systems:

| System | Where to Check | Expected |
|--------|---------------|----------|
| ASC | Subscriptions → Product ID | `com.example.app.subscription.monthly` / `.annual` |
| RevenueCat | Products tab → App Store Product ID | Same as ASC |
| Code | `app_constants.dart` → `monthlyProductId` / `annualProductId` | Same as ASC |
| Code | `.env` → `REVENUECAT_API_KEY` | Matches RevenueCat dashboard |

### Step 4.5: subscriptionSubmissions API Workaround

If the "In-App Purchases and Subscriptions" section doesn't appear on the ASC version page (common when version was created before Paid Apps Agreement became Active):

1. Use the ASC API `subscriptionSubmissions` endpoint to flag subscriptions for review
2. Both products should return 201 Created with `isAppStoreReviewInProgress: true`
3. Write DETAILED App Review notes explaining: products exist, tested in sandbox, how to test
4. Reply in Resolution Center with comprehensive explanation

Treat this as a fallback. Confirm the current App Store Connect API behavior in Apple's official documentation before using it.

### Step 5: Sandbox Test (Physical Device)

Only after Steps 1-4 pass:

1. Create a **new sandbox tester** in ASC (Users and Access → Sandbox → Testers)
2. Install the app on a physical device
3. Navigate to paywall
4. Check: do **real prices** load? (localized from StoreKit, not hardcoded fallbacks)
5. Tap purchase button — does StoreKit sheet appear?
6. Complete sandbox purchase

### Step 6: Code Investigation (Only If Steps 1-5 Pass)

Only if config is correct AND sandbox test fails, look at code:

1. Enable verbose RevenueCat logging: `await Purchases.setLogLevel(LogLevel.verbose);`
2. Check `purchase_service.dart` → `initialize()` → is `_isConfigured = true`?
3. Check `purchase_service.dart` → `getOfferings()` → what does it return?
4. Check `purchase_providers.dart` → `fallbackProductsProvider` → what does StoreKit return?
5. Run debug build on device, read Console.app logs

## Common Root Causes (by frequency)

1. **Paid Apps Agreement not Active** — StoreKit product fetches can fail until agreements, tax, and banking are complete
2. **RevenueCat packages empty** — offerings exist but no products attached
3. **ASC subscription localizations "Rejected"** — need to re-save
4. **Subscriptions not attached to app version page** — use subscriptionSubmissions API + detailed review notes as workaround (confirmed Apr 2026)
5. **Product IDs mismatch** — typo between ASC/RevenueCat/code
6. **Code silently swallows errors** — rare, usually config

## Notes

- Paid Apps Agreement changes can take **hours** to propagate to sandbox
- RevenueCat config changes take effect **immediately**
- ASC subscription product changes may need **24-48 hours** to propagate
- Always test on a **physical device** — simulators don't support real StoreKit
