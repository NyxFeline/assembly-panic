# ⚙️ ASSEMBLY PANIC: GLITCHED MACHINE

> _"Assemble. Panic. Repeat — if the system allows."_

🎮 `Phaser 3`　　⚡ `JavaScript ES6+`　　🔧 `Vite`　　📄 `MIT License`　　🛸 `SYS BUILD 0.4.1`

```
> SYSTEM BOOT SEQUENCE...
> LOADING ASSEMBLY_PANIC.EXE
> WARNING: CONSCIOUSNESS_MODULE UNSTABLE
> INITIALIZING GLITCH_ENGINE... OK
> READY.
```

## 🚀 [PLAY NOW](https://assembly-panic.netlify.app/)

---

## 🤖 Introduction

**Assembly Panic: Glitched Machine** is a 2D web arcade game built on **Phaser 3**.

You are not the technician. You **are** the machine — and that machine is suffering a critical system failure.

On an assembly line that never stops, your job is to complete mini-robots by pressing the correct key sequence before the countdown hits zero. Easy enough — unless your own input controller starts to betray you.

This is a game about **controlled** chaos. About trying to do things right, while you yourself are the one that's broken.

---

## ✨ Key Features

### 🔁 Endless Gameplay

The game runs continuously with no levels or stages. Every time you complete a product, the time limit for the next round decreases slightly. Speed increases. Pressure increases. You can't "win" — you can only _survive longer_.

### ⚡ Glitch System — Reversed Controls

The mechanic that sets this game apart. Periodically, the system activates **Glitch Mode**: keys are completely swapped (`[A] ↔ [D]`, `[S] ↔ [F]`). But before it happens, the game always broadcasts a **telegraph warning** — a red screen flash, shaking flickering text, and noise audio — giving the player time to mentally adapt.

### 🔥 Combo System

Complete correct sequences in a row to build up your **CHAIN STATUS**. Score multiplies with your combo. One mistake — the chain breaks and all installed parts are stripped off.

### 🖥️ Retro Terminal UI

The entire UI is designed like an 80s computer terminal, using the **Jersey 10** font, green `#00ff88` on a black `#1a1a2e` background, with scanline effects and pixel rendering. Consistent from boot screen to game over screen.

### 💀 Blue Screen of Death (BSOD) Game Over

When time runs out, the game doesn't just end — it _completely crashes_. A blue screen of death appears with the text `FATAL ERROR: CONSCIOUSNESS_DELETED`, your score is "dumped" like a crash report, and you must press `[R]` to **REBOOT SYSTEM**.

---

## 🎮 How to Play

### Controls

| Key   | Action                        |
| ----- | ----------------------------- |
| `[A]` | Install **HEAD UNIT**         |
| `[S]` | Install **TRACK SYSTEM**      |
| `[D]` | Install **SIDE WEAPON**       |
| `[F]` | Install **BACKPACK**          |
| `[R]` | **REBOOT** (BSOD screen only) |

### Rules

1. **Read the sequence**: The slot display shows the order in which parts must be installed. Read left to right.
2. **Press in order**: Press the key matching the **correct part in sequence**. Press the wrong one — the entire progress resets.
3. **Watch the clock**: Each round has a time limit shown in the top-left as `SYS TIMER`. When it hits 0 — Game Over.
4. **Watch for Glitches**: When the screen flashes red and a `⚠ SYSTEM ERROR / REVERSE CONTROL` warning appears, brace yourself — after `1 second`, the keys will be reversed.

### Scoring

```
Score per round = 10 × current CHAIN_STATUS
Wrong input     → CHAIN_STATUS resets to 0
```

---

## 🛠️ Installation

**Requirements:** Node.js `>= 16.x`

```bash
# 1. Clone repository
git clone https://github.com/your-username/assembly-panic.git
cd assembly-panic

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open the game at: `http://localhost:5173`

```bash
# Build for production
npm run build

# Preview the build
npm run preview
```

---

## 📁 Project Structure

```
assembly-panic/
├── public/
│   └── assets/
│       ├── fonts/          # Local font: Jersey10-Regular.ttf
│       ├── img/            # Robot sprites (base, head, track, side, back)
│       └── sounds/         # Audio: bgm, click, error, glitch
└── src/
    ├── config/
    │   └── constants.js    # All game configuration constants
    ├── scenes/
    │   ├── BootScene.js    # Menu / instructions screen
    │   └── UIScene.js      # HUD overlay (timer, score, combo, glitch warning, BSOD)
    ├── systems/
    │   ├── EventBus.js     # Communication bridge between Scenes
    │   ├── GlitchManager.js # Manages the full glitch lifecycle
    │   └── InputSystem.js  # Handles input, slots, assembly, and combos
    ├── GameScene.js        # Main scene: game loop, timer, orchestration
    └── main.js             # Phaser initialization, waits for font load
```

---

## 🔬 Technical Details

### EventBus — Bridge Between Scenes

Phaser 3 runs `GameScene` and `UIScene` in parallel. The two scenes have no direct references to each other, so any state changes in `GameScene` (score, timer, glitch state, game over) must be passed to `UIScene` to update the HUD.

**Solution:** `EventBus.js` is a singleton `Phaser.Events.EventEmitter` instance — imported directly as an ES6 module, ensuring the same instance is shared across the entire application.

```
GameScene / GlitchManager / InputSystem
         │
         │  EventBus.emit("timer:changed", time, color)
         │  EventBus.emit("score:changed", score)
         │  EventBus.emit("combo:changed", combo)
         │  EventBus.emit("glitch:start")
         │  EventBus.emit("glitch:end")
         │  EventBus.emit("game:over", { score, combo })
         ▼
       UIScene
  (listens & updates HUD)
```

> ⚠️ When the game ends and needs to restart, `EventBus.removeAllListeners()` is called to clean up all listeners before restarting the scene — preventing memory leaks and duplicate listeners.

---

### GlitchManager — Glitch Lifecycle

`GlitchManager` handles the full glitch lifecycle across a 3-phase pipeline:

```
[IDLE] ──(random 5–8 sec)──► [TELEGRAPH] ──(1 sec)──► [GLITCH ACTIVE] ──(3 sec)──► [IDLE]
```

**Phase 1 — Telegraph (Warning):**
A translucent red rectangle covers the screen + the text `⚠ SYSTEM ERROR / REVERSE CONTROL` flickers for **1 second**. The player receives the signal and has time to process it.

**Phase 2 — Glitch Active (Reversed):**
The flag `isReversed = true` is activated. `InputSystem` checks this flag every frame in `update()`:

```javascript
// InputSystem.js — update()
const translate = (k) =>
  this.scene.glitchManager.isReversed ? REVERSE_MAP[k] : k;
// REVERSE_MAP = { A: "D", D: "A", S: "F", F: "S" }

if (JustDown(this.keys.A)) this.handleInput(translate("A"));
```

When `isReversed = true`, pressing `[A]` actually passes `handleInput("D")`. A `[ REVERSED ]` indicator flickers on screen and `glitch.ogg` loops continuously to remind the player.

**Phase 3 — Recovery:**
After `GLITCH_DURATION` (3 seconds), `isReversed` returns to `false`, `EventBus.emit("glitch:end")` fires, and a new glitch timer begins counting down.

---

### Key Configuration Constants

| Constant             | Value    | Description                              |
| -------------------- | -------- | ---------------------------------------- |
| `GLITCH_MIN_DELAY`   | `5000ms` | Minimum wait time between glitches       |
| `GLITCH_MAX_DELAY`   | `8000ms` | Maximum wait time between glitches       |
| `GLITCH_TELEGRAPH`   | `1000ms` | Warning duration before glitch activates |
| `GLITCH_DURATION`    | `3000ms` | Duration of active glitch                |
| `TIME_DECREASE_STEP` | `0.5s`   | Time reduction per completed round       |
| `MIN_ROUND_TIME`     | `3s`     | Minimum time allowed per round           |

---

## 🎨 Asset Credits

- **Robot Sprites:** [Modular 64x Robots](https://croomfolk.itch.io/modular-64x-robots) by **croomfolk**.
- **UI & Environment:** Assets from [Kenney.nl](https://kenney.nl/) (Creative Commons Zero).
- **Additional Assets:** Various open-source assets from Itch.io and other community platforms.
- **Font:** [Jersey 10](https://fonts.google.com/specimen/Jersey+10) via Google Fonts.
- **Audio:** Sourced from open-source libraries.

_Many thanks to the artists who share their work freely with the community._

---

## 👾 Credits

```
╔══════════════════════════════════════════╗
║   SYS BUILD 0.4.1                        ║
║   ANTHROPIC ROBOTICS CORP                ║
║   DEVELOPED BY: NyxFeline                ║
║                                          ║
║   Built with Phaser 3 + Vite             ║
║   Font: Jersey 10 (Google Fonts)         ║
╚══════════════════════════════════════════╝
```

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

```
> PROCESS TERMINATED
> FATAL ERROR: README_EOF
> _
```
