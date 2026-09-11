# Lucky Dangle 📿✨

**Lucky Dangle** is a lightweight, polished Windows 10 & 11 desktop widget that renders an authentic traditional decorative charm hanging from a thin string attached to the very top edge of your screen.

Built with **Electron**, **React**, **TypeScript**, **Vite**, and **HTML5 Canvas Physics**.

---

## 🌟 Highlights

- **Floating Transparent Window**: Frameless, transparent desktop window positioned flush against the top bezel of your monitor with zero background artifacts.
- **Smart Click-Through**: Clicks outside the charm pass through directly to underlying Windows applications (games, browser, code editor, etc.). Hovering over or interacting with the charm captures mouse events seamlessly.
- **Realistic Dangling Physics**:
  - Multi-body pendulum simulation with gravity, air resistance damping, and elastic string tension.
  - Secondary charm tilt lag (rotational inertia wobble).
  - Tertiary bottom bell and tassel micro-pendulum swaying.
  - Interactive mouse dragging and flick velocity transfer.
- **4 Traditional Decorative Charms**:
  - 📿 **Imperial Mandala**: Deep crimson lacquer, 24K gold filigree floral rings, ruby jewel center, and chiming brass ghungroo bells.
  - 🧧 **Feng Shui Mystic Knot**: Auspicious scarlet endless knot, jade gem, Qing Dynasty brass coin with embossed square hole, and flowing silk tassel.
  - 🐘 **Royal Golden Ganesha**: Hand-embossed 24K gold relief medallion, radiating lotus sunburst rim, ruby accents, and lustrous teardrop pearls.
  - 🧿 **Protective Nazar Eye**: Turkish/Mediterranean amulet in cobalt blue, turquoise, pearl white, and obsidian pupil framed in gold filigree.
- **Procedural Audio (Web Audio API)**: Harmonic brass bell chimes and soft bead clacks on flicks and swings (toggleable with volume control, zero external audio dependencies).
- **Windows System Tray & Quick Context Menu**: Dynamic tray menu with quick charm switching, position presets, animation toggles, and quit.
- **Modern Glassmorphic Settings Dialog**: Tabbed interface to customize charms, physics intensity, pendulum length, multi-monitor display selection, and Windows startup.
- **Multi-Monitor Support**: Auto-detects connected displays, preserves monitor selection, and calculates accurate top-edge coordinates.
- **Windows Startup**: Toggleable launch-on-boot integration via Windows Login Items.

---

## 🚀 Getting Started

### Prerequisites
- Windows 10 or Windows 11
- Node.js (v18+) & npm

### Development
```bash
# Install dependencies
npm install

# Start Vite dev server and launch Electron
npm run dev
```

### Production Build
```bash
# Compile TypeScript, Vite frontend, and Electron main/preload
npm run build
```

### Packaging Windows Installer & Portable Executable
```bash
# Produces Lucky-Dangle-Setup.exe and Lucky-Dangle-Portable.exe in dist-package/
npm run package
```

---

## 🔄 CI/CD & Automated Releases

The project includes a fully automated GitHub Actions workflow defined in `.github/workflows/ci-cd.yml`.

### Automated Workflow Triggers
- **Push to `main`**: Runs TypeScript validation (`npx tsc --noEmit`), production build (`npm run build`), packages the Windows executables (`npm run package`), and uploads them as workflow artifacts (`lucky-dangle-windows`).
- **Pull Request to `main`**: Runs the same validation and build checks to prevent regressions.
- **Git Tags (`v*`)**: Runs the build and package pipeline, then automatically creates a GitHub Release and attaches both Windows binaries.

### Commands Summary

- **Development**:
  ```bash
  npm install
  npm run dev
  ```

- **Build**:
  ```bash
  npm run build
  ```

- **Package**:
  ```bash
  npm run package
  ```

- **Automated GitHub Release**:
  ```bash
  git tag v1.0.0
  git push origin v1.0.0
  ```
  Pushing any tag matching `v*` (e.g. `v1.0.0`, `v1.1.0`, `v2.0.0`) automatically creates a GitHub Release with auto-generated release notes and attaches:
  - `Lucky-Dangle-Setup.exe` (NSIS Windows Installer)
  - `Lucky-Dangle-Portable.exe` (Standalone Portable Executable)

---

## 🎮 Controls & Interactions

- **Left Click + Drag**: Grab and pull the charm anywhere on your screen.
- **Quick Flick & Release**: Imparts angular momentum causing the charm to swing naturally before settling.
- **Double Click**: Gives the charm a playful swinging nudge.
- **Right Click on Charm**: Opens the quick context menu.
- **System Tray Icon**: Left-click to toggle visibility, right-click for quick settings or to open the full Settings dialog.

---

## 📁 Project Structure

```
Lucky Dangle/
├── build/                     # App icons (.ico, .png, tray-icon.png)
├── scripts/                   # Build and development orchestration scripts
├── src/
│   ├── main/                  # Electron Main Process
│   │   ├── windows/           # Dangle overlay and Settings windows
│   │   ├── monitors.ts        # Display detection & coordinate math
│   │   ├── store.ts           # JSON persistence in %APPDATA%
│   │   ├── tray.ts            # Windows system tray
│   │   └── ipc.ts             # Type-safe IPC channels
│   ├── preload/               # Secure contextBridge API
│   ├── shared/                # Shared TypeScript types and constants
│   └── renderer/              # Vite + React application
│       ├── dangle/            # Canvas physics, hit-testing, and vector charms
│       ├── settings/          # Glassmorphic settings UI
│       └── styles/            # CSS tokens and styling
└── dist-package/              # Windows installer and portable executables
```
