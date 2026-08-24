---
name: device-logs
description: Capture and inspect iOS device logs for app, purchase, and error debugging.
---

# /device-logs — Capture iOS Device Logs

Stream logs from a connected iOS device, filtered for common debug patterns.

## Usage

```
/device-logs                    # all app logs
/device-logs purchase           # purchase/StoreKit/RevenueCat only
/device-logs sentry             # Sentry/error only
```

## Instructions

### Step 1 — Ensure libimobiledevice is installed

```bash
brew list libimobiledevice 2>/dev/null || brew install libimobiledevice
```

### Step 2 — Verify device connected

```bash
idevice_id -l
```

If empty, ask user to connect via USB-C. Wireless connections may not work for syslog.

### Step 3 — Start log capture with filter

**All app logs:**
```bash
idevicesyslog | grep -iE "Runner|<app-process-or-bundle-name>"
```

**Purchase/IAP filter:**
```bash
idevicesyslog | grep -iE "PurchaseService|RevenueCat|StoreKit|Purchases|offerings|product|subscription|paywall"
```

**Sentry/Error filter:**
```bash
idevicesyslog | grep -iE "sentry|error|exception|crash|fatal"
```

**Custom filter (from argument):**
```bash
idevicesyslog | grep -iE "<user-provided-filter>"
```

Run the capture in background with a timeout:
```bash
idevicesyslog 2>&1 | grep -iE "<filter>" | head -100 &
BGPID=$!
sleep 30
kill $BGPID 2>/dev/null
```

### Step 4 — Ask user to reproduce the issue

While logs are streaming, have the user perform the action on their device. Capture output and analyze.

## Notes

- Release/TestFlight builds suppress Flutter debug logs (`kDebugMode` is false)
- RevenueCat verbose logging only works if `LogLevel.verbose` is set (debug builds only by default)
- `flutter logs` only works on debug builds connected via Dart VM service
- For release build diagnostics, `idevicesyslog` is the only CLI option
- Console.app (GUI) is the alternative if CLI doesn't work
- iOS privacy redacts most app log content in syslog — debug builds give better output
