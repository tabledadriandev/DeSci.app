# CSS Split Summary

## Changes Made

### 1. Created Separate CSS Files
- **Website CSS**: `app/(website)/globals.css` - For website routes (/, /coin, /app-download)
- **Wellness App CSS**: `app/(wellness)/app/globals.css` - For wellness app routes (/app/*)

### 2. Updated Layouts
- **Root Layout** (`app/layout.tsx`): Imports website CSS for all routes
- **Wellness App Layout** (`app/(wellness)/app/layout.tsx`): Imports wellness CSS for /app/* routes

### 3. CSS Differences

#### Website CSS (app/(website)/globals.css)
- Glassmorphism button styles (backdrop-blur, transparent backgrounds)
- Uppercase headings with text-transform
- Link styles with hover animations
- Glassmorphism card styles
- Section padding utilities
- OPUS design system styling

#### Wellness App CSS (app/(wellness)/app/globals.css)
- Solid button styles (solid backgrounds, no glassmorphism)
- Regular headings (no text-transform)
- Simpler card styles (white background, borders)
- Wellness app specific styling
- Better suited for app interface

## How It Works

1. **Website Routes** (/, /coin, /app-download):
   - Root layout loads website CSS
   - Wellness layout doesn't apply (routes don't match /app/*)
   - Website styles are used

2. **Wellness App Routes** (/app/*):
   - Root layout loads website CSS (base styles)
   - Wellness layout loads wellness CSS (overrides for app)
   - Wellness styles take precedence for conflicting styles
   - Both CSS variables are available (same names, wellness overrides)

## Result

✅ Website routes use website CSS (glassmorphism, elegant styling)
✅ Wellness app routes use wellness CSS (solid buttons, app-friendly styling)
✅ No conflicts - wellness CSS overrides website CSS for /app/* routes
✅ Website remains unchanged and functional

