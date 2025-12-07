/**
 * PreviewGrid Component
 * Visual simulation of piece movement capabilities
 * Shows valid moves on a grid with the piece at the center
 */

import { isMoveValid } from "../logic/rule-validator";
import type { MovementCap } from "../types/rules";
import { isLeapCapability } from "../types/rules";

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
    let bgClass = "bg-slate-800/50";
    let borderClass = "border-slate-700/50";
    let contentClass = "";

    if (isCenter) {
      bgClass = "bg-gradient-to-br from-blue-600 to-blue-700";
      borderClass = "border-blue-500 shadow-lg shadow-blue-500/30";
    } else if (isValid) {
      bgClass = "bg-gradient-to-br from-green-500 to-green-600";
      borderClass = "border-green-400 shadow-lg shadow-green-500/20";
      contentClass = "hover:scale-110 cursor-pointer";
    }

    // Show coordinates on hover for debugging
    const showCoords = !isCenter && (dx !== 0 || dy !== 0);

    return (
      <div
        key={index}
        className={`relative w-full aspect-square rounded-xl flex items-center justify-center border transition-all ${bgClass} ${borderClass} ${contentClass} group`}
        title={showCoords ? `(${dx}, ${dy})` : "Piece position"}
      >
        {isCenter && (
          <span className="text-3xl sm:text-4xl drop-shadow-2xl animate-pulse-slow">
            {symbol || "♟"}
          </span>
        )}
        {isValid && !isCenter && (
          <div className="relative">
            <div className="w-4 h-4 bg-white rounded-full opacity-80 group-hover:opacity-100 transition-all shadow-lg" />
            <div className="absolute inset-0 w-4 h-4 bg-white rounded-full animate-ping opacity-20" />
          </div>
        )}
        {/* Coordinate overlay on hover */}
        {showCoords && (
          <div className="absolute inset-0 bg-slate-900/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl backdrop-blur-sm">
            <span className="text-white text-xs font-mono font-semibold">
              {dx > 0 ? `+${dx}` : dx},{dy > 0 ? `+${dy}` : dy}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/60 to-slate-800/30 rounded-2xl p-6 border border-slate-700/50 flex flex-col gap-5 shadow-xl backdrop-blur-sm hover:border-slate-600/50 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Movement Preview
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-1.5">
            Simulates valid moves from piece perspective
          </p>
        </div>
        <button
          onClick={onTogglePerspective}
          className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-semibold transition-all border border-slate-600/50 shadow-lg hover:shadow-xl hover:scale-105"
        >
          Player {playerPerspective} View
        </button>
      </div>

      {/* Grid */}
      <div className="bg-slate-900/70 rounded-2xl p-5 shadow-2xl border border-slate-800/50">
        <div
          className="grid gap-2"
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
      <div className="flex items-center justify-center gap-8 text-xs bg-slate-900/30 py-3 rounded-xl border border-slate-700/30">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 border border-blue-500 shadow-lg shadow-blue-500/30" />
          <span className="text-slate-400 font-medium">Piece Position</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-green-500 to-green-600 border border-green-400 shadow-lg shadow-green-500/30" />
          <span className="text-slate-400 font-medium">Valid Move</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-slate-800 border border-slate-700" />
          <span className="text-slate-400 font-medium">Invalid</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700/50">
        <div className="text-center bg-slate-900/30 py-4 rounded-xl border border-slate-700/30 hover:border-blue-500/30 transition-all">
          <div className="text-3xl font-bold text-blue-400 mb-1">
            {capabilities.length}
          </div>
          <div className="text-xs text-slate-500 font-medium">Capabilities</div>
        </div>
        <div className="text-center bg-slate-900/30 py-4 rounded-xl border border-slate-700/30 hover:border-green-500/30 transition-all">
          <div className="text-3xl font-bold text-green-400 mb-1">
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
          <div className="text-xs text-slate-500 font-medium">Valid Moves</div>
        </div>
        <div className="text-center bg-slate-900/30 py-4 rounded-xl border border-slate-700/30 hover:border-purple-500/30 transition-all">
          <div className="text-3xl font-bold text-purple-400 mb-1">
            {capabilities.filter((c) => isLeapCapability(c)).length}
          </div>
          <div className="text-xs text-slate-500 font-medium">Leap Rules</div>
        </div>
      </div>

      {/* Info box */}
      {capabilities.length === 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-5 text-center shadow-lg">
          <p className="text-yellow-400 text-sm font-semibold flex items-center justify-center gap-2">
            <span className="text-lg">⚠️</span>
            Add capabilities to see valid moves
          </p>
        </div>
      )}
    </div>
  );
}
