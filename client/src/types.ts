// Matches your Rust 'PlayerId'
export type PlayerId = string;

// Matches your Rust 'PieceType'
export type PieceType = string;

// Matches your Rust 'Piece' struct
export interface Piece {
  piece_type: PieceType;
  owner: PlayerId;
}

// Matches your Rust 'Board' type: [[Option<Piece>; 8]; 8]
// In JS/TS, Option<T> becomes T | null
export type Board = (Piece | null)[][];

// Matches your Rust 'GameState'
export interface GameState {
  board: Board;
  current_turn: PlayerId;
  players: [PlayerId, PlayerId];
}

// The messages we send TO the server
export type ClientMessage =
  | { type: "join"; payload: { name: string } }
  | { type: "move"; payload: { from: [number, number]; to: [number, number] } };

// Server message types
export interface ServerMessage {
  type: "state" | "event";
  payload: GameState | string;
}
