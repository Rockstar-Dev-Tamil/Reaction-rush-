# ⚡ Reaction Rush

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Web Audio API](https://img.shields.io/badge/Web_Audio_API-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white)
![Google Fonts](https://img.shields.io/badge/Google_Fonts-4285F4?style=for-the-badge&logo=google-fonts&logoColor=white)
![No Dependencies](https://img.shields.io/badge/Dependencies-Zero-00E676?style=for-the-badge)
![License MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)
![Discord](https://img.shields.io/badge/Discord-Join_Us-5865F2?style=for-the-badge&logo=discord&logoColor=white)

A fast-paced, cinematic reaction-time game built with pure HTML, CSS, and Vanilla JavaScript. Test your reflexes, build streaks, and compete on the leaderboard — all wrapped in a stunning futuristic neon UI.

**[Join the Discord →](https://discord.gg/g9tNSWFh4r)**

---

## 🎮 How to Play

1. Click **Start the Rush** (or press `SPACE`)
2. Wait for the arena to turn **green** 🟢
3. Click as fast as you can!
4. **Don't click on red** — that's a false start and resets your score

The faster you click, the more points you earn. Build streaks for multiplied scores.

---

## ✨ Features

### Core Gameplay
- **Progressive difficulty** — delay windows shrink as you advance
- **Streak multipliers** — consecutive successes multiply your score
- **Bonus rounds** — random 2x score opportunities with purple arena
- **Deception flashes** — fake color flashes designed to trick you into clicking early
- **Performance tiers** — Godlike (<150ms), Incredible, Great, Nice, Okay, Sluggish

### Cinematic UI/UX
- **Fullscreen animated intro** with staggered title reveal and blur-in effects
- **Glitch-on-hover** text effects and animated gradient typography
- **Glassmorphism panels** with backdrop blur throughout
- **Arena state animations** — breathing idle, tension pulse waiting, spring pop on go, shake on penalty
- **Particle explosions** — 4 particle types (glow, sparks, trails, emojis) with physics simulation
- **Floating score numbers** that rise from click point
- **Godlike impact** — screen shake + radial flash + 80-particle burst
- **Cursor glow spotlight** that follows your mouse
- **Ambient gradient orbs** with slow drift animation
- **Film grain noise overlay** for cinematic texture

### Stats & Leaderboard
- **Top 5 leaderboard** — saves your best run scores (score saved when streak ends)
- **Lifetime stats** — average reaction time, total rounds played, best score
- **Slide-up glass modal** with staggered entry animations and medals (🥇🥈🥉)

### Audio
- **Procedural Web Audio** — no audio files needed
- Unique tones for active, success, penalty, and bonus states
- Layered oscillators for richer sound design
- Toggle on/off from the HUD

### Themes
| Theme | Description |
|-------|-------------|
| **Neon Dark** | Deep navy background, cyan/pink/purple neon accents |
| **Cyberpunk** | Near-black, neon yellow text, JetBrains Mono font |
| **Minimal Light** | Clean off-white, subtle pastel accents |

---

## 🛠️ Tech Stack

- **HTML5** — Semantic markup, SEO meta tags
- **CSS3** — Custom properties, keyframe animations, backdrop-filter, clamp(), aspect-ratio
- **Vanilla JavaScript** — ES6 classes, requestAnimationFrame, performance.now()
- **Web Audio API** — Procedural sound synthesis
- **localStorage** — Persistent scores and settings
- **Google Fonts** — Outfit (UI) + JetBrains Mono (stats/code)

**Zero dependencies. No build step. No frameworks.**

---

## 📁 Project Structure

```
Reaction-Rush/
├── index.html      # Main HTML — intro, game arena, HUD, stats modal
├── style.css       # Design system, animations, themes, responsive
├── game.js         # Game logic, state machine, scoring, UI updates
├── particles.js    # Particle system with physics simulation
├── audio.js        # Web Audio procedural sound engine
└── README.md
```

---

## 🚀 Run Locally

Just open `index.html` in any modern browser. No server required.

Or serve with:
```bash
npx http-server . -p 8080
```

Then open `http://localhost:8080`

---

## 🎯 Scoring System

| Reaction Time | Tier | Base Score |
|---------------|------|-----------|
| < 150ms | Godlike! | 850+ |
| < 200ms | Incredible! | 800+ |
| < 250ms | Great! | 750+ |
| < 320ms | Nice | 680+ |
| < 400ms | Okay | 600+ |
| 400ms+ | Sluggish... | < 600 |

**Final score** = `base_score × streak_multiplier`

Bonus rounds multiply by 2x before the streak multiplier.

---

## 📱 Responsiveness

Fully responsive with optimized layouts for:
- **Desktop** (1280px+) — full experience with cursor glow and hover effects
- **Tablet** (768px) — scaled arena, compact HUD
- **Mobile** (480px) — touch-optimized, compact layout

---

## 🤝 Community

Join our Discord to share your scores, suggest features, and compete!

**[Discord Server →](https://discord.gg/g9tNSWFh4r)**

---

## 📄 License

MIT — feel free to fork, modify, and share.
