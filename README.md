# FanPulse AI — Beyond the Score. Understand the Game.

**FanPulse AI** is a Premier League football intelligence platform engineered for fans, tacticians, and analysts. Beyond standard box scores, FanPulse AI uncovers tactical systems, match momentum curves, head-to-head player radars, and deterministic league standings scenario modeling.

---

## Core Intelligence Modules

1. **RaceState — League Table Projections & Scenarios**
   - Live Premier League table calculation from match baseline.
   - Deterministic what-if matchday scenario simulator (Home Win, Draw, Away Win).
   - Zone displacements (Champions League, Europa League, Conference League, Relegation).
   - Conversational AI Analyst grounded in standings mathematics.

2. **TactiQ — Interactive Pitch & Formations**
   - High-resolution spatial football pitch with official markings.
   - Team formation switching and lineup coordinate inspector.
   - 5-lane spatial channel breakdown (half-spaces, central channel, wings).
   - AI Analyst grounded in structured tactical positions and in-game events.

3. **Context90 — Narrative Timeline & Match Intelligence**
   - Categorized decisive match milestones (Tactical shifts, goals, discipline, substitutions).
   - Executive tactical recap and verified key observations.
   - Conversational AI Analyst answering in-depth match inquiries strictly from evidence.

4. **PlayerPulse — Head-to-Head Player Analytics**
   - Per-90 normalized radar profiles and performance trajectory charts.
   - Hexagonal player attribute radar comparing technical and tactical metrics.
   - Transparent performance scoring heuristic clamped to [4.00, 10.00].

---

## Getting Started

### Prerequisites
- Node.js 18.17+ or 20+
- A Google Gemini API key (optional for simulated offline testing; required for live AI responses)

### Installation
```bash
npm install
```

### Configuration
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to explore FanPulse AI.

### Testing & Verification
```bash
# Run complete test suite (76 automated tests)
npm test

# Run TypeScript type check
npx tsc --noEmit

# Run ESLint
npm run lint

# Run production build
npm run build
```

---

## Product Principles

- **Beyond the Score**: We elevate analysis above superficial statistics by contextualizing match narrative and tactical mechanics.
- **Evidence Grounding**: AI analysis is strictly bound to empirical telemetry and verified data structures without inventing events.
- **Transparent Heuristics**: Calculated ratings, momentum curves, and scenario projections disclose their deterministic formulas openly.
