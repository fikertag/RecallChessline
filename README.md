# LearnChess — Personal Chess Opening Learning & Repertoire Platform

A modern, full-stack chess platform designed to help competitive and improving chess players build, organize, branch, analyze, and memorize their personal opening repertoires through **active recall** and **visual move trees**.

---

## 🌟 Key Features

### 1. Opening Tree Builder (Core Engine)
- **Interactive Chessboard**: Fully responsive board powered by `react-chessboard` and validated by `chess.js`.
- **Unlimited Branching**: Every opponent move can have multiple alternative responses, creating rich opening trees rather than flat linear PGNs.
- **Move Annotations**: Attach NAG symbols (`!`, `!!`, `!?`, `?!`, `?`, `??`), strategic commentary, and YouTube timestamps to any node.
- **Variation Pruning**: Prune side variations or delete entire subtrees safely without corrupting other lines.
- **Keyboard Navigation**: Fast navigation with `←` (previous move), `→` (next move), `Home` (start position), and board flip (`RotateCcw`).

### 2. Active Recall & Guided Training
- **Guided Practice**: The engine automatically plays opponent moves from your saved repertoire tree, challenging you to play the correct repertoire response.
- **Recall Practice**: Blind testing mode where hints are hidden until requested. Immediate visual feedback on blunders, mistake tracking, and retry mechanics.
- **Branch-Aware Traversal**: Randomly or sequentially samples opponent variations to ensure comprehensive repertoire coverage.
- **Celebration & Session Analytics**: Confetti bursts on line completion, accuracy tracking, and mistake review tables.

### 3. Real-Game Expansion & PGN Merging
- Encounter an unfamiliar move in a tournament game, Chess.com, or Lichess?
- Paste the PGN or game sequence directly into your study.
- **Safe Merge Guarantee**: New opponent moves automatically create side branches without overwriting any existing preparation.

### 4. Spaced Repetition & Dashboard Analytics
- Total studies, opening variations count, training sessions, and overall accuracy.
- **Need Revision**: Identifies neglected lines or low-accuracy variations for spaced repetition practice.
- Pre-seeded starter studies: **Italian Game (White)** and **Sicilian Defense Najdorf (Black)**.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router, Turbopack, Server Actions)
- **Language**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS & Lucide Icons
- **Chess Rules & Validation**: `chess.js` v1.4
- **Board UI**: `react-chessboard` v5.12
- **State Management**: Zustand (Interactive board & tree store) & TanStack Query (Server state)
- **Database & Auth**: Mongoose + MongoDB (with automated zero-config local persistence fallback in `.data/db.json` if MongoDB daemon is not running)
- **Testing**: Vitest unit test suite

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Run the Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Automated Tests
```bash
pnpm test
```

### 4. Build for Production
```bash
pnpm build
pnpm start
```

---

## ♟️ Move Tree Architecture

```
                    Root (Starting FEN)
                             │
                          1. e4
                             │
                          1... e5
                             │
                          2. Nf3
                   ┌─────────┴─────────┐
             2... Nc6               2... Nf6 (Petrov)
                   │                   │
                3. Bc4              3. Nxe5
          ┌────────┴────────┐
     3... Bc5            3... Nf6 (Two Knights)
          │                   │
        4. c3              4. Ng5 (Fried Liver)
```
Each node stores its parent pointer, children IDs, full FEN, UCI, SAN, and tactical notes, enabling bidirectional traversal and lossless branching.
