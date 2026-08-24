---
name: telegram-report
description: Send a formatted report or message to a Telegram chat using the Telegram MCP plugin.
---

# Telegram Report

Send a message to Telegram via MCP.

## Instructions

### Step 1 — Parse Arguments

From `$ARGUMENTS`:
- First argument: chat_id (for example, `<CHAT_ID>`)
- Remaining: message content or topic to report on

### Step 2 — Prepare Message

If a topic was given instead of a direct message:
1. Gather relevant data (metrics, status, summary)
2. Format into a clear, concise report

Format for Telegram:
- Use Markdown formatting (bold, italic, code)
- Keep messages under 4096 characters
- Use bullet points for lists
- Include relevant numbers/metrics

### Step 3 — Send via MCP

Use the Telegram MCP reply tool:
- `mcp__plugin_telegram_telegram__reply` with chat_id and the formatted message
- If the message is a response to a specific message, include reply_to

### Step 4 — Confirm

Tell the user what was sent and to which chat.
