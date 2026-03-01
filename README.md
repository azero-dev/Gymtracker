# Gymtrack

**Gymtrack** is an offline workout tracker. Track your routines and monitor your progress with dynamic charts.

## Features

- **Fully Responsive**: Optimized for both mobile and desktop use.
- **Offline-First**: Uses IndexedDB (via Dexie.js) to store everything locally on your device. No server required, no internet needed.
- **Progress Tracking**: Beautiful charts to visualize your improvements over time.
- **️ Custom Templates**: Create and manage your own workout routines with custom parameters and units.
- **Cross-Platform**:
  - **Web**: Installable as a PWA.
  - **Android**: Full APK support via Capacitor.
  - **Linux**: Native desktop application via Tauri.

## Installation & Setup

### For Arch Linux (Native)
We provide a `PKGBUILD` for easy installation:
```bash
makepkg -si
```
Once installed, you can launch the app simply by typing `gymtrack` in your terminal or via your application launcher.

### For Android
1. Build the web project:
   ```bash
   npm run build:android
   ```
2. Open the `android` folder in **Android Studio**.
3. Build and deploy your APK.

## Tech Stack

- **Frontend**: Preact + Vite
- **Styling**: Tailwind CSS
- **Database**: IndexedDB (Dexie.js)
- **Charts**: Chart.js
- **Desktop Wrapper**: Tauri (Rust)
- **Mobile Wrapper**: Capacitor

## Visualization

Keep track of your PRs and progress with the integrated chart system.
