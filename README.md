# Gymtrack

Gymtrack is an offline-first workout tracker designed to log routines and visualise progress via dynamic charts.

## Features

- **Offline-First:** Utilises IndexedDB for local persistence. No server dependencies or internet connectivity required.
- **Progress Tracking:** Renders time-series charts to visualise performance metrics.
- **Custom Templates:** Define and manage workout routines with configurable parameters and units.
- **Cross-Platform Deployment:**
  - **Web:** Installable as a Progressive Web App (PWA).
  - **Linux:** Native desktop binary via Tauri.

## Installation

### Arch Linux

Build and install using the provided `PKGBUILD`:

```bash
makepkg -si
```

Execute via terminal (`gymtrack`) or application launcher.

### Debian/Ubuntu

Download the `.deb` package from the [Releases](https://github.com/azero-dev/Gymtracker/releases/) section and install via:

```bash
sudo dpkg -i gymtrack_*.deb
```

### Other Linux Distributions

A portable `AppImage` is available in the [Releases](https://github.com/azero-dev/Gymtracker/releases/) section. Make it executable and run:

```bash
chmod +x gymtrack-*.AppImage
./gymtrack-*.AppImage
```

### Mobile (PWA)

**Firefox:**
1. Open the application URL.
2. Access the menu (⋮) in the bottom-right corner.
3. Select "Add to Home Screen".
4. Confirm installation.

**Chrome:**
1. Open the application URL.
2. Access the menu (⋮) in the top-right corner.
3. Select "Install App" or "Add to Home Screen".
4. Confirm installation.

## Tech Stack

- **Frontend:** Preact + Vite
- **Styling:** Tailwind CSS
- **Database:** IndexedDB (Dexie.js)
- **Visualization:** Chart.js
- **Desktop Runtime:** Tauri (Rust)
- **Mobile Runtime:** Capacitor

## AI Disclosure

Generative AI tools were utilised for code generation within this project.