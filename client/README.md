# Consensus Game - React Client

A reactive UI for the Consensus Game, built with React, TypeScript, and Tailwind CSS.

## Mental Model: "UI as a Function of State"

This UI follows the reactive programming paradigm:
- Rust sends a GameState snapshot
- React sees the new data
- React re-renders the entire board instantly

## Getting Started

### 1. Start the Rust Server

In the project root:
```bash
cd server
cargo run
```

Wait for: `Listening on 127.0.0.1:3000`

### 2. Start the React Client

In a new terminal:
```bash
cd client
npm run dev
```

### 3. Test the Game

1. Open http://localhost:5173 in your browser
2. Enter "Alice" and click "Join Game"
3. Open a second browser tab/window
4. Enter "Bob" and click "Join Game"
5. You should see the game board with pawns on rows 1 and 6

### 4. Play the Game

- Click a piece to select it (square turns yellow)
- Click a destination square to move
- The board updates automatically via WebSocket

## Architecture

```
┌─────────────┐         WebSocket         ┌─────────────┐
│   React UI  │ ◄─────────────────────── │ Rust Server │
│             │                            │             │
│  - App.tsx  │ ─────────────────────────►│ game_loop   │
│  - Hook     │  { type: "move", ... }    │             │
└─────────────┘                            └─────────────┘
```

### File Structure

- `src/types.ts` - TypeScript definitions matching Rust structs
- `src/useGameSocket.ts` - WebSocket logic (connection, send, receive)
- `src/App.tsx` - UI components (lobby, board, logs)
- `src/index.css` - Tailwind CSS directives

## Features

- **Real-time Updates**: Board updates instantly when any player moves
- **Turn Indication**: Shows whose turn it is
- **Move Validation**: Server validates all moves (bounds, turn, piece ownership)
- **Visual Feedback**: Selected piece highlighted in yellow
- **Event Logs**: Right panel shows all game events
- **Lobby System**: Join with a name, wait for opponent

## Troubleshooting

**Board is empty**: Check that the Rust server is broadcasting state updates. Look for `Broadcasting state:` in server logs.

**Can't move pieces**: Make sure it's your turn (indicated at top of board).

**Connection issues**: Ensure Rust server is running on port 3000.
