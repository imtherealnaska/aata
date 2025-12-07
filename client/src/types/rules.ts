/**
 * Type definitions aligned with Rust backend (core/src/rules.rs)
 * Represents the movement capabilities and rules for chess-like pieces
 */

export type SlidePattern = "linear" | "diagonal" | "omni";

/**
 * Movement capability types
 * - slide: Continuous movement in a direction (like rook, bishop, queen)
 * - leap: Jump to specific offsets (like knight)
 */
export type MovementCap =
  | {
      type: "slide";
      pattern: SlidePattern;
      range: number; // 0 = infinite, 1-8 otherwise
      can_jump: boolean;
      only_forward: boolean;
    }
  | {
      type: "leap";
      possibilities: [number, number][]; // List of relative (x,y) jumps
    };

/**
 * Complete rule definition for a piece type
 * Note: 'capabilitites' matches Rust backend spelling (has typo)
 */
export interface PieceRule {
  name: string;
  symbol: string;
  capabilitites: MovementCap[];
}

/**
 * Helper function to create a default slide capability
 */
export const createSlideCapability = (
  pattern: SlidePattern = "linear",
  range: number = 1,
  can_jump: boolean = false,
  only_forward: boolean = false
): MovementCap => ({
  type: "slide",
  pattern,
  range,
  can_jump,
  only_forward,
});

/**
 * Helper function to create a default leap capability
 */
export const createLeapCapability = (
  possibilities: [number, number][] = []
): MovementCap => ({
  type: "leap",
  possibilities,
});
