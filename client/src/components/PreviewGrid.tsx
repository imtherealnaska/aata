/**
 * PreviewGrid Component
 * Visual simulation of piece movement capabilities
 * Shows valid moves on a grid with the piece at the center
 */

import { isMoveValid } from "../logic/rule-validator";
import type { MovementCap } from "../types/rules";

interface PreviewGridProps {
  capabilities: MovementCap[];
  symbol: string;
  forwardY: number;
  playerPerspective: 1 | 2;
  onTogglePerspective: () => void;
  gridSize?: number;
}

export function PreviewGrid({
  capabilities,
  symbol,
  forwardY,
  playerPerspective,
  onTogglePerspective,
  gridSize = 9,
}: PreviewGridProps) {
  const center = Math.floor(gridSize / 2);

  const renderCell = (x: number, y: number, index: number) => {
    const dx = x - center;
    const dy = y - center;

    const isCenter = dx === 0 && dy === 0;
    const isValid = isMoveValid(dx, dy, capabilities, forwardY);

    // Determine cell styling
    let bgClass = "bg-gray-800";
    let borderClass = "border-gray-700";
    let contentClass = "";

    if (isCenter) {
      bgClass = "bg-gradient-to-br from-blue-600 to-blue-700";
      borderClass = "border-blue-500";
    } else if (isValid) {
      bgClass = "bg-gradient-to-br from-green-500 to-green-600";
      borderClass = "border-green-400";
      contentClass = "hover:scale-110";
    }

    // Show coordinates on hover for debugging
    const showCoords = !isCenter && (dx !== 0 || dy !== 0);

    return (
      <div
        key={index}
        className={`relative w-full aspect-square rounded-lg flex items-center justify-center border transition-all ${bgClass} ${borderClass} ${contentClass} group`}
        title={showCoords ? `(${dx}, ${dy})` : "Piece position"}
      >
        {isCenter && (
          <span className="text-3xl sm:text-4xl drop-shadow-lg">
            {symbol || "♟"}
          </span>
        )}
        {isValid && !isCenter && (
          <div className="relative">
            <div className="w-3 h-3 bg-white rounded-full opacity-70 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 w-3 h-3 bg-white rounded-full animate-ping opacity-30" />
          </div>
        )}
        {/* Coordinate overlay on hover */}
        {showCoords && (
          <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
            <span className="text-white text-xs font-mono">
              {dx > 0 ? `+${dx}` : dx},{dy > 0 ? `+${dy}` : dy}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="text-yellow-400">🎯</span> Movement Preview
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Simulates valid moves from piece perspective
          </p>
        </div>
        <button
          onClick={onTogglePerspective}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-all border border-gray-600"
        >
          Player {playerPerspective} View
        </button>
      </div>

      {/* Grid */}
      <div className="bg-gray-900 rounded-xl p-4 shadow-inner">
        <div
          className="grid gap-1.5"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: gridSize * gridSize }).map((_, i) => {
            const x = i % gridSize;
            const y = Math.floor(i / gridSize);
            return renderCell(x, y, i);
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-600 to-blue-700 border border-blue-500" />
          <span className="text-gray-400">Piece Position</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-green-500 to-green-600 border border-green-400" />
          <span className="text-gray-400">Valid Move</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-800 border border-gray-700" />
          <span className="text-gray-400">Invalid</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-700">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">
            {capabilities.length}
          </div>
          <div className="text-xs text-gray-500">Capabilities</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">
            {capabilities.reduce((count, cap) => {
              let moves = 0;
              for (let y = 0; y < gridSize; y++) {
                for (let x = 0; x < gridSize; x++) {
                  const dx = x - center;
                  const dy = y - center;
                  if (isMoveValid(dx, dy, [cap], forwardY)) moves++;
                }
              }
              return count + moves;
            }, 0)}
          </div>
          <div className="text-xs text-gray-500">Valid Moves</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">
            {capabilities.filter((c) => c.type === "leap").length}
          </div>
          <div className="text-xs text-gray-500">Leap Rules</div>
        </div>
      </div>

      {/* Info box */}
      {capabilities.length === 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center">
          <p className="text-yellow-400 text-sm">
            ⚠️ Add capabilities to see valid moves
          </p>
        </div>
      )}
    </div>
  );
}
