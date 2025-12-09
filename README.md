# AATA

> What if you could play chess, but before the game starts, you and your opponent design the pieces together?

This is a real-time multiplayer game where two players don't just play by the rules—they _negotiate_ the rules first. Want a Dragon piece that moves like a Queen but can jump over other pieces? Propose it. Your opponent can accept it, or reject it... but they only get 3 rejections before they're forced to accept whatever comes next.

The result is a weird, collaborative chess-like game where the rule negotiation is almost as interesting as the game itself.

## The Core Idea

Traditional board games come with fixed rules. Chess has been the same for centuries. But what if the meta-game was about consensus building? This project explores that space—two players must agree on custom game pieces before they can use them, but there's a disagreement budget that forces eventual consensus.

The technical challenge was interesting too: build a composable rule engine where movement patterns are data, not code. A piece isn't defined by hard-coded logic like `if piece == "knight" then move_in_L_shape()`—instead, pieces are JSON configurations that describe capabilities like "slide diagonally with range 5" or "leap in an L-shape."

## How It Actually Works

Two players connect to the game. The board starts with some default pieces: Pawns, Knights, Rooks, and Kings. Then the negotiation begins.

Say Player A wants to add a "Dragon" piece that can move in any direction and jump over obstacles. They propose this through the rule builder UI. Player B sees the proposal and can either accept it or reject it. If they reject, their disagreement counter goes up (max 3). If they accept, the Dragon is now a valid piece both players can spawn during the game.

Here's where it gets interesting: after 3 rejections, Player B _loses their veto power_ for one proposal. The next thing Player A proposes gets auto-accepted. This forces players to eventually compromise instead of just blocking everything.

Once rules are settled (or during the game—players can propose new pieces anytime), the actual gameplay is turn-based. Move your pieces, capture your opponent's pieces, and try to eliminate all their royal pieces to win.

### The Disagreement Budget

This is the heart of the consensus mechanism. Each player can say "no" exactly 3 times. On the 4th disagreement, the next proposal bypasses voting entirely. Then the counter resets.

```
Player A: "I want a Dragon that flies anywhere and jumps obstacles"
Player B: Reject (1/3 disagreements)

Player A: "How about a Phoenix that leaps 3 squares?"
Player B: Reject (2/3 disagreements)

Player A: "Fine, just a fast Rook then?"
Player B: Reject (3/3 disagreements)

Player A: "Actually, I want that flying Dragon again"
Player B: [No vote—auto-accepted] (0/3 disagreements)
```

It's forced consensus, but you still have agency over _when_ you spend your rejections.

## Tech Stack

### Backend: Rust + Tokio

The server is built with the actor pattern. There's a single `GameLoop` actor that owns all game state. No shared mutable state, no `Arc<Mutex<T>>`—just message passing.

```
WebSocket connections → mpsc channel → GameLoop → broadcast channel → all connections
```

Commands flow in (Join, MakeMove, ProposeRule, VoteOnProposal), state updates broadcast out. Everything's async with Tokio, and Axum handles the WebSocket routing.

The interesting part is the rule engine. Movement capabilities are just data:

```rust
enum MovementCap {
    Slide {
        pattern: SlidePattern,  // FrontBack, Diagonal, or Omni
        range: u8,              // 0 = infinite range
        can_jump: bool,
        only_forward: bool,
    },
    Leap {
        possibilities: Vec<(i8, i8)>,  // All valid jump offsets
    },
}
```

A Knight? That's just `Leap` with 8 L-shaped offsets. A Rook? `Slide` with `pattern: FrontBack` and `range: 0` (infinite). Custom pieces can combine multiple capabilities—slide _and_ leap, or whatever else players dream up.

### Frontend: React + TypeScript

**I am bad at GUI, so let AI do this**

The client is a React app (v19) with TypeScript and Tailwind CSS. Vite handles the build. There's a WebSocket hook that manages the connection to the server and syncs game state in real-time.

The UI has three main parts:

- **The game board** – standard 8x8 grid, pieces render with images (or custom icons for player-created pieces)
- **Rule builder** – a form where you design new pieces by adding capabilities
- **Vote modal** – pops up when your opponent proposes a rule, shows you what they want and lets you accept/reject

Move validation happens client-side for responsiveness (highlights valid squares when you select a piece) and server-side for security.

## Getting It Running

You'll need Rust and Node.js installed.

**Start the server:**

```bash
cargo run --release
# Listens on http://localhost:3000
```

**Start the client (separate terminal):**

```bash
cd client
npm install
npm run dev
# Runs on http://localhost:5173
```

Open two browser windows to `http://localhost:5173`. Both players join, and you're ready to start negotiating rules.

## Message Protocol

Communication happens over WebSocket with JSON messages. Here's what they look like:

**Proposing a new piece:**

```json
{
  "type": "propose_rule",
  "payload": {
    "rule": {
      "name": "Dragon",
      "symbol": "D",
      "is_royal": false,
      "capabilities": [
        {
          "slide": {
            "pattern": "omni",
            "range": 0,
            "can_jump": true,
            "only_forward": false
          }
        }
      ]
    }
  }
}
```

**Voting on a proposal:**

```json
{
  "type": "vote",
  "payload": {
    "accept": true
  }
}
```

**Making a move:**

```json
{
  "type": "move",
  "payload": {
    "from": [2, 1],
    "to": [3, 3]
  }
}
```

The server broadcasts state updates after every action, so both clients stay in sync.

## Project Structure

```
aata/
├── server/          # Rust backend
│   └── src/
│       ├── main.rs           # Axum server + WebSocket handler
│       └── game_loop.rs      # Actor managing game state
│
├── core/            # Shared game logic (Rust library)
│   └── src/
│       ├── lib.rs            # GameState, Board, Player types
│       ├── rules.rs          # MovementCap definitions
│       └── errors.rs         # Error types
│
└── client/          # React frontend
    └── src/
        ├── main.tsx          # Entry point
        ├── App.tsx           # Main game component
        ├── useGameSocket.ts  # WebSocket connection hook
        ├── components/
        │   ├── RuleBuilder.tsx
        │   ├── VoteModal.tsx
        │   └── ...
        └── logic/
            └── rule-validator.ts
```

## Why This Exists

I wanted to explore two ideas:

1. **Consensus as gameplay** – Most competitive games are zero-sum. What happens when you force cooperation before competition? The disagreement budget creates an interesting dynamic where players have to pick their battles.

2. **Data-driven rules** – Board games usually hard-code piece logic. I wanted to see if you could build a system where movement rules are just JSON configurations. Turns out, you can. The entire rule engine is generic—it doesn't "know" what a Knight or Rook is, it just interprets capability data.
