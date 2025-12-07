import type { MovementCap, PieceRule } from "./types/rules";

// Matches your Rust 'PlayerId'
export type PlayerId = string;

// Matches your Rust 'PieceType'
export type PieceType = string;

// Matches your Rust 'Piece' struct
export interface Piece {
  piece_type: PieceType;
  owner: PlayerId;
  capabilities?: MovementCap[];
}

// Matches your Rust 'Board' type: [[Option<Piece>; 8]; 8]
// In JS/TS, Option<T> becomes T | null
export type Board = (Piece | null)[][];

// Matches your Rust 'GameState'
export interface GameState {
  board: Board;
  current_turn: PlayerId;
  players: [PlayerId, PlayerId];
  rules: Record<string, PieceRule>;
}

// The messages we send TO the server
export type ClientMessage =
  | { type: "join"; payload: { name: string } }
  | { type: "move"; payload: { from: [number, number]; to: [number, number] } }
  | { type: "propose_rule"; payload: { rule: PieceRule } };

// Server message types
export interface ServerMessage {
  type: "state" | "event";
  payload: GameState | string;
}

// Re-export PieceRule from rules.ts
export type { PieceRule, MovementCap };
