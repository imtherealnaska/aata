/**
 * Type definitions aligned with Rust backend (core/src/rules.rs)
 * Represents the movement capabilities and rules for chess-like pieces
 */

export type SlidePattern = "linear" | "diagonal" | "omni";

/**
 * Movement capability types - matches Rust externally tagged enum format
 * - slide: Continuous movement in a direction (like rook, bishop, queen)
 * - leap: Jump to specific offsets (like knight)
 *
 * Note: This uses externally tagged enum format to match Rust serde default.
 * JSON format examples:
 * - Slide: { "slide": { "pattern": "linear", "range": 1, "can_jump": false, "only_forward": false } }
 * - Leap: { "leap": { "possibilities": [[1, 2], [2, 1]] } }
 */
export type MovementCap =
  | {
      slide: {
        pattern: SlidePattern;
        range: number; // 0 = infinite, 1-8 otherwise
        can_jump: boolean;
        only_forward: boolean;
      };
    }
  | {
      leap: {
        possibilities: [number, number][]; // List of relative (x,y) jumps
      };
    };

export interface PieceRule {
  name: string;
  symbol: string;
  capabilities: MovementCap[];
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
  slide: {
    pattern,
    range,
    can_jump,
    only_forward,
  },
});

/**
 * Helper function to create a default leap capability
 */
export const createLeapCapability = (
  possibilities: [number, number][] = []
): MovementCap => ({
  leap: {
    possibilities,
  },
});

/**
 * Type guard to check if a capability is a Slide
 */
export const isSlideCapability = (cap: MovementCap): cap is { slide: { pattern: SlidePattern; range: number; can_jump: boolean; only_forward: boolean } } => {
  return 'slide' in cap;
};

/**
 * Type guard to check if a capability is a Leap
 */
export const isLeapCapability = (cap: MovementCap): cap is { leap: { possibilities: [number, number][] } } => {
  return 'leap' in cap;
};
