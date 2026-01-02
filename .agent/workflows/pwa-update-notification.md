---
description: Guidelines for PWA update notifications and when to bump service worker version
---

# PWA Update Notification Policy

## When to Show Update Notification to Users

Only bump the service worker version (in `frontend/public/sw.js`) and trigger update notifications for **BIG changes** that affect user experience.

### ✅ DO Trigger Update Notification For:
- **Major Bug Fixes** - Issues that were annoying users (e.g., XP points wrong, login issues)
- **Performance Improvements** - Made app significantly faster or smoother
- **New Features** - Added new pages, new functionality users can see
- **UI/UX Improvements** - Redesigned pages, better mobile experience
- **Stability Fixes** - Fixed crashes, fixed data not loading properly

### ❌ DO NOT Trigger Update Notification For:
- Small CSS tweaks or typo fixes
- Backend-only changes users don't see
- Internal code refactoring
- Minor optimizations
- Development/debugging changes

## How to Bump Version

1. Open `frontend/public/sw.js`
2. Change `CACHE_VERSION` at line 5 (e.g., from 'v5' to 'v6')
3. Update the comment with a user-friendly description

## Message Style Guidelines

Write user-friendly messages, NOT technical jargon.

| ❌ Bad (Technical) | ✅ Good (User-Friendly) |
|--------------------|------------------------|
| Fixed XP state management bug | Fixed XP points display |
| Optimized API caching layer | Made the app faster & smoother |
| Resolved streak calculation error | Fixed day streak tracking |
| Added PWA enhancements | Better app experience |
| Fixed bundle chunk splitting | Faster loading times |

## Update Card Location

The update notification card is in `frontend/src/main.jsx` in the `showUpdateNotification()` function.

## Example Commit Flow for Big Changes

```bash
# 1. Make your big change
# 2. Update SW version in sw.js
# 3. Commit with user-friendly message
git add .
git commit -m "Improve app performance and fix loading issues

- Made dashboard load 50% faster
- Fixed XP points showing incorrectly
- Better mobile experience"
git push origin main
```

## Remember

- Users will see the update notification on their mobile PWA
- Keep messages simple - no technical terms
- The card shows: 🚀 "New Version Available!" with Update Now / Later buttons
