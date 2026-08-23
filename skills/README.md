# AIMix — Agent Skills

Drop-in skills for any AI agent (Claude, Cursor, ChatGPT, custom SDK). Just **copy a link** below and paste it to your AI — it will fetch the skill and use AIMix for you.

> Tip: start with the **aimix** entry skill — it covers setup and links to all capability skills.

## Skills

| Capability | Copy link below and paste to your AI |
|---|---|

## How to use

Paste to your AI (Claude, Cursor, ChatGPT, …):

```
```

Then ask normally — *"generate an image of a cat"*, *"transcribe this URL"*, etc.

## Configure your shell once

```bash
export AIMIX_URL="http://localhost:20128"   # local default, or your VPS / tunnel URL
export AIMIX_KEY="sk-..."                   # from Dashboard → Keys (only if requireApiKey=true)
```

Verify: `curl $AIMIX_URL/api/health` → `{"ok":true}`.

## Links

- Dashboard: http://localhost:20128
