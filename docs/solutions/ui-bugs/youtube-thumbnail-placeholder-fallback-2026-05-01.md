---
title: YouTube thumbnail shows grey placeholder instead of real image
date: "2026-05-01"
category: ui-bugs
module: hub-library
problem_type: ui_bug
component: frontend_stimulus
severity: low
symptoms:
  - "YouTube thumbnail for video LnODnKOEp34 displays a grey placeholder (3 dots) instead of actual video thumbnail"
  - "maxresdefault.jpg returns HTTP 200 with placeholder image instead of 404, so img onError fallback chain never fires"
root_cause: wrong_api
resolution_type: code_fix
tags:
  - youtube-thumbnail
  - library-accordion
  - image-fallback
  - hub-library
---

# YouTube thumbnail shows grey placeholder instead of real image

## Problem

YouTube's CDN returns a grey placeholder image (HTTP 200) instead of a 404 for `maxresdefault.jpg` on certain videos, causing the `<img>` `onError` fallback chain to never fire and leaving users with a broken-looking grey thumbnail on the Champions Hub Library page.

## Symptoms

- Grey placeholder image (grey background with 3 centered dots) displayed for the video "A School That Feels Like Family" (`LnODnKOEp34`) on the Hub Library page
- The `onError` handler on the `<img>` element never fires despite the thumbnail being visually broken
- The fallback to `hqdefault.jpg` never triggers
- HTTP request to `https://img.youtube.com/vi/LnODnKOEp34/maxresdefault.jpg` returns status 200 (not 404)

## What Didn't Work

- **Original `onError` fallback chain (`maxresdefault` -> `hqdefault`)**: The browser's `onError` event only fires on network failures or HTTP error responses. YouTube returns a 200 with valid image data (the grey placeholder), so the event never fires. The fallback is structurally unreachable for these videos.
- **Adding `sddefault.jpg` to the fallback chain**: Would not help because the root issue is that `onError` never fires in the first place — adding more fallback steps to a chain that never executes changes nothing.

## Solution

Added a per-video optional `thumbnail` override field and downloaded a valid thumbnail locally for the affected video. Also improved the general fallback chain from 2-step to 3-step.

**Before:**

```tsx
<img
  src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
  onError={(e) => {
    const target = e.currentTarget;
    if (!target.dataset.fallback) {
      target.dataset.fallback = "1";
      target.src = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
    }
  }}
/>
```

**After:**

```tsx
<img
  src={video.thumbnail ?? `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
  onError={(e) => {
    const target = e.currentTarget;
    if (video.thumbnail) return;
    const step = target.dataset.fallback;
    if (!step) {
      target.dataset.fallback = "1";
      target.src = `https://img.youtube.com/vi/${video.youtubeId}/sddefault.jpg`;
    } else if (step === "1") {
      target.dataset.fallback = "2";
      target.src = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
    }
  }}
/>
```

Key changes:

1. Added optional `thumbnail` field to the video type (`{ youtubeId: string; title: string; thumbnail?: string }`)
2. Downloaded the valid `sddefault.jpg` for `LnODnKOEp34` to `public/assets/thumbnails/LnODnKOEp34.jpg`
3. The `<img>` `src` uses `video.thumbnail` when present, bypassing YouTube's CDN entirely
4. When a custom thumbnail is set, `onError` returns early (no fallback needed)
5. General fallback chain improved to 3-step: `maxresdefault` -> `sddefault` -> `hqdefault`

## Why This Works

YouTube's CDN for `maxresdefault.jpg` does not consistently return HTTP 404 for videos without a high-resolution thumbnail. For certain videos, it returns HTTP 200 with a valid grey placeholder image. The browser's `<img>` `onError` event only fires on network errors or HTTP error status codes — a successfully loaded image (even a placeholder) does not trigger it.

By providing a local thumbnail override (`video.thumbnail`), the component bypasses YouTube's CDN entirely for known-problematic videos, rendering a verified-good image from `public/assets/thumbnails/`. The improved 3-step fallback chain provides better coverage for videos where YouTube does return proper 404s but lacks a max-resolution version.

## Prevention

- **Do not rely solely on `onError` for image quality fallbacks from external CDNs**: The `onError` event only handles HTTP errors and network failures, not semantically-wrong-but-valid responses.
- **Validate thumbnails when adding new videos**: Check whether `maxresdefault.jpg` returns a real thumbnail or a placeholder. Flag videos that need a local override using the `thumbnail` field.
- **Prefer local assets for critical visual content**: For curated libraries, consider downloading and serving thumbnails locally rather than depending on external CDN behavior.

## Related Issues

- None found in existing documentation or GitHub issues.
