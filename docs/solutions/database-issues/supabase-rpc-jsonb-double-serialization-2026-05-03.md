---
title: Supabase RPC jsonb parameter double-serialization causes scalar error
date: "2026-05-03"
category: database-issues
module: intake
problem_type: database_issue
component: database
severity: high
symptoms:
  - 'PostgreSQL error code 22023: "cannot extract elements from a scalar"'
  - "Supabase error object logs as {} with default console.error"
root_cause: wrong_api
resolution_type: code_fix
tags:
  - supabase-rpc
  - jsonb
  - json-stringify
  - postgresql
  - server-action
---

# Supabase RPC jsonb parameter double-serialization causes scalar error

## Problem

Calling a Supabase RPC function with a `jsonb` parameter wrapped in `JSON.stringify()` causes PostgreSQL to receive a scalar string instead of a JSON array, failing with "cannot extract elements from a scalar" when the function tries to iterate the value.

## Symptoms

- PostgreSQL error code `22023`: `"cannot extract elements from a scalar"`
- Server action returns generic "Submission failed" to the client
- Error object logs as `{}` with default `console.error` (must use `JSON.stringify(error, null, 2)` to see actual message)
- The `jsonb_array_elements()` call inside the RPC function fails

## What Didn't Work

- **PostgREST schema cache reload** (`NOTIFY pgrst, 'reload schema'`): The function existed correctly with the right signature — this was a parameter encoding issue, not a schema visibility problem.
- **Default error logging**: `console.error("failed:", error)` printed `{}` because Supabase PostgrestError properties don't serialize with the default formatter. This hid the real error for multiple debugging attempts.

## Solution

Remove `JSON.stringify()` and pass the plain JavaScript array directly to `supabase.rpc()`.

**Before (broken):**
```typescript
const { data: result, error } = await supabase.rpc("submit_intake", {
  // ...other params...
  p_children: JSON.stringify(
    data.children.map((c) => ({
      first_name: c.first_name,
      grade: c.grade || null,
      age: c.age ?? null,
      gender: c.gender || null,
    }))
  ),
});
```

**After (fixed):**
```typescript
const { data: result, error } = await supabase.rpc("submit_intake", {
  // ...other params...
  p_children: data.children.map((c) => ({
    first_name: c.first_name,
    grade: c.grade || null,
    age: c.age ?? null,
    gender: c.gender || null,
  })),
});
```

## Why This Works

The Supabase JS client automatically serializes JavaScript objects and arrays to PostgreSQL `jsonb` when passing parameters to `.rpc()` calls via PostgREST. When you wrap the value in `JSON.stringify()`, the client receives a string and serializes *that* — resulting in a doubly-encoded JSON string scalar (e.g., `"\"[{...}]\""`) rather than a JSON array. PostgreSQL stores this as a jsonb scalar string, and `jsonb_array_elements()` cannot iterate over a scalar.

## Prevention

- **Never use `JSON.stringify()` on parameters passed to `supabase.rpc()`** — the client handles all jsonb serialization. Pass plain JS objects/arrays.
- **Always log Supabase errors with `JSON.stringify(error, null, 2)`** — the default `console.error` formatter hides the PostgreSQL error code and message.
- **When seeing "cannot extract elements from a scalar"**, check for double-encoding at the RPC call site before investigating schema or function definition issues.
- **Treat PostgREST schema cache issues as a last resort** — parameter encoding problems are far more common than schema visibility issues.

## Related Issues

- `docs/solutions/best-practices/pipeline-crm-feature-patterns-2026-05-02.md` — Pattern 5 (server action pattern) documents the broader convention; this doc supplements it with RPC-specific jsonb guidance.
- `src/lib/actions/intake.ts` — The corrected call site (passing plain array to `p_children` jsonb param).
- `supabase/migrations/009_add_postal_code.sql` — The RPC function definition showing `p_children jsonb` parameter and `jsonb_array_elements()` usage.
