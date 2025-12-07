/**
 * Movement Validation Engine
 * Mirrors the backend logic from core/src/lib.rs (apply_move function)
 * Calculates valid moves for preview and client-side validation
 */

import type { MovementCap, SlidePattern } from "../types/rules";
import { isSlideCapability, isLeapCapability } from "../types/rules";

/**
 * Check if a move from (0,0) to (dx, dy) is valid based on capabilities
 * This is used for the preview grid where the center is treated as (0,0)
 *
 * @param dx - Delta X (horizontal displacement)
 * @param dy - Delta Y (vertical displacement)
 * @param caps - Array of movement capabilities
 * @param forwardY - Direction of "forward" (1 for player 1, -1 for player 2)
 * @returns true if the move is valid according to at least one capability
 */
export function isMoveValid(
  dx: number,
  dy: number,
  caps: MovementCap[],
  forwardY: number = 1
): boolean {
  if (dx === 0 && dy === 0) return false; // Can't move to self

  for (const cap of caps) {
    if (isSlideCapability(cap)) {
      // Check forward-only constraint
      if (cap.slide.only_forward) {
        // In preview, forward is based on forwardY direction
        if (dy !== 0 && Math.sign(dy) !== forwardY) {
          continue;
        }
        // If moving purely sideways (dy === 0) with only_forward, it's invalid
        if (dy === 0) {
          continue;
        }
      }

      // Check range constraint
      const dist = Math.max(Math.abs(dx), Math.abs(dy));
      if (cap.slide.range > 0 && dist > cap.slide.range) {
        continue;
      }

      // Check pattern matching
      const matchesPattern = checkPatternMatch(dx, dy, cap.slide.pattern);
      if (!matchesPattern) {
        continue;
      }

      // If we reached here, this capability allows the move
      // Note: can_jump and path checking happen in the actual game state
      return true;
    } else if (isLeapCapability(cap)) {
      // Check if (dx, dy) exists in the possibilities list
      const match = cap.leap.possibilities.some(
        ([ox, oy]) => ox === dx && oy === dy
      );
      if (match) return true;
    }
  }

  return false;
}

/**
 * Check if movement matches the given pattern
 */
function checkPatternMatch(dx: number, dy: number, pattern: SlidePattern): boolean {
  switch (pattern) {
    case "linear":
      // Orthogonal: Either horizontal or vertical, not both
      return dx === 0 || dy === 0;
    case "diagonal":
      // Diagonal: abs(dx) === abs(dy)
      return Math.abs(dx) === Math.abs(dy);
    case "omni":
      // Omnidirectional: Either orthogonal or diagonal
      return dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy);
  }
}

/**
 * Generate all valid moves for a piece in a preview grid
 * @param caps - Movement capabilities
 * @param gridSize - Size of the preview grid (default 7x7)
 * @param forwardY - Direction of forward movement
 * @returns Array of [dx, dy] valid moves
 */
export function generateValidMoves(
  caps: MovementCap[],
  gridSize: number = 7,
  forwardY: number = 1
): [number, number][] {
  const center = Math.floor(gridSize / 2);
  const validMoves: [number, number][] = [];

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const dx = x - center;
      const dy = y - center;

      if (isMoveValid(dx, dy, caps, forwardY)) {
        validMoves.push([dx, dy]);
      }
    }
  }

  return validMoves;
}

/**
 * Get a human-readable description of a capability
 */
export function describeCapability(cap: MovementCap): string {
  if (isSlideCapability(cap)) {
    let desc = `Slide ${cap.slide.pattern}`;
    if (cap.slide.range === 0) {
      desc += " (unlimited range)";
    } else {
      desc += ` (${cap.slide.range} square${cap.slide.range > 1 ? "s" : ""})`;
    }
    if (cap.slide.only_forward) {
      desc += " [forward only]";
    }
    if (cap.slide.can_jump) {
      desc += " [can jump]";
    }
    return desc;
  } else if (isLeapCapability(cap)) {
    return `Leap (${cap.leap.possibilities.length} pattern${cap.leap.possibilities.length !== 1 ? "s" : ""})`;
  }
  return "Unknown capability";
}
