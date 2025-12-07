/**
 * CapabilityEditor Component
 * Provides UI for configuring both Slide and Leap movement capabilities
 */

import { useState } from "react";
import type { MovementCap, SlidePattern } from "../types/rules";

interface CapabilityEditorProps {
  capability: MovementCap;
  onChange: (cap: MovementCap) => void;
  onSave: () => void;
  onCancel: () => void;
  isEditing: boolean;
}

export function CapabilityEditor({
  capability,
  onChange,
  onSave,
  onCancel,
  isEditing,
}: CapabilityEditorProps) {
  const [capType, setCapType] = useState<"slide" | "leap">(capability.type);

  // Leap editor state
  const [leapInput, setLeapInput] = useState("");

  const handleTypeChange = (newType: "slide" | "leap") => {
    setCapType(newType);
    if (newType === "slide") {
      onChange({
        type: "slide",
        pattern: "linear",
        range: 1,
        can_jump: false,
        only_forward: false,
      });
    } else {
      onChange({
        type: "leap",
        possibilities: [],
      });
    }
  };

  const handleAddLeapPattern = () => {
    if (capability.type !== "leap") return;

    // Parse input like "2,1" or "2 1" or "(2,1)"
    const cleaned = leapInput.replace(/[()]/g, "").trim();
    const parts = cleaned.split(/[,\s]+/).map((s) => parseInt(s.trim(), 10));

    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      const [dx, dy] = parts;
      const newPattern: [number, number] = [dx, dy];

      // Check if pattern already exists
      const exists = capability.possibilities.some(
        ([x, y]) => x === dx && y === dy
      );

      if (!exists) {
        onChange({
          ...capability,
          possibilities: [...capability.possibilities, newPattern],
        });
      }
      setLeapInput("");
    }
  };

  const handleRemoveLeapPattern = (index: number) => {
    if (capability.type !== "leap") return;
    onChange({
      ...capability,
      possibilities: capability.possibilities.filter((_, i) => i !== index),
    });
  };

  const handleAddKnightPattern = () => {
    if (capability.type !== "leap") return;
    // Standard knight L-shape moves
    const knightMoves: [number, number][] = [
      [2, 1],
      [2, -1],
      [-2, 1],
      [-2, -1],
      [1, 2],
      [1, -2],
      [-1, 2],
      [-1, -2],
    ];
    onChange({
      ...capability,
      possibilities: [...capability.possibilities, ...knightMoves],
    });
  };

  return (
    <div className="mt-4 bg-gradient-to-br from-gray-700 to-gray-800 p-6 rounded-xl border-2 border-gray-600 animate-fade-in shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-white text-lg">
          {isEditing ? "Edit Capability" : "New Capability"}
        </h4>
        <div className="flex gap-2">
          <button
            onClick={() => handleTypeChange("slide")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              capType === "slide"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            → Slide
          </button>
          <button
            onClick={() => handleTypeChange("leap")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              capType === "leap"
                ? "bg-purple-600 text-white shadow-lg"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            ⇝ Leap
          </button>
        </div>
      </div>

      {capability.type === "slide" ? (
        <div className="flex flex-col gap-4">
          {/* Pattern Selection */}
          <div>
            <label className="block text-sm text-gray-300 mb-2 font-medium">
              Movement Pattern
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["linear", "diagonal", "omni"] as SlidePattern[]).map((p) => (
                <button
                  key={p}
                  onClick={() => onChange({ ...capability, pattern: p })}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    capability.pattern === p
                      ? "bg-blue-600 text-white shadow-lg ring-2 ring-blue-400"
                      : "bg-gray-900 text-gray-400 hover:bg-gray-800 border border-gray-700"
                  }`}
                >
                  {p === "linear" && "➕ Linear"}
                  {p === "diagonal" && "✖️ Diagonal"}
                  {p === "omni" && "✨ Omni"}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {capability.pattern === "linear" &&
                "Moves horizontally or vertically (like Rook)"}
              {capability.pattern === "diagonal" &&
                "Moves diagonally (like Bishop)"}
              {capability.pattern === "omni" &&
                "Moves in any direction (like Queen)"}
            </p>
          </div>

          {/* Range Slider */}
          <div>
            <label className="block text-sm text-gray-300 mb-2 font-medium">
              Range: {capability.range === 0 ? "∞ Unlimited" : capability.range}
            </label>
            <input
              type="range"
              min="0"
              max="8"
              value={capability.range}
              onChange={(e) =>
                onChange({ ...capability, range: parseInt(e.target.value) })
              }
              className="w-full h-2 bg-gray-900 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>∞</span>
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
              <span>6</span>
              <span>7</span>
              <span>8</span>
            </div>
          </div>

          {/* Constraints */}
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 text-sm text-gray-300 cursor-pointer group">
              <input
                type="checkbox"
                checked={capability.only_forward}
                onChange={(e) =>
                  onChange({ ...capability, only_forward: e.target.checked })
                }
                className="w-5 h-5 accent-blue-500 cursor-pointer"
              />
              <span className="group-hover:text-white transition-colors">
                <strong>Forward Only</strong> - Can only move toward opponent
              </span>
            </label>
            <label className="flex items-center gap-3 text-sm text-gray-300 cursor-pointer group">
              <input
                type="checkbox"
                checked={capability.can_jump}
                onChange={(e) =>
                  onChange({ ...capability, can_jump: e.target.checked })
                }
                className="w-5 h-5 accent-blue-500 cursor-pointer"
              />
              <span className="group-hover:text-white transition-colors">
                <strong>Can Jump</strong> - Can move over other pieces
              </span>
            </label>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Leap Patterns */}
          <div>
            <label className="block text-sm text-gray-300 mb-2 font-medium">
              Jump Patterns (relative offsets)
            </label>

            {/* Preset: Knight */}
            <button
              onClick={handleAddKnightPattern}
              className="w-full mb-3 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-all"
            >
              ⚡ Add Standard Knight Pattern (8 moves)
            </button>

            {/* Custom Pattern Input */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={leapInput}
                onChange={(e) => setLeapInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddLeapPattern()}
                placeholder="e.g., 2,1 or -1,2"
                className="flex-1 bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none text-sm"
              />
              <button
                onClick={handleAddLeapPattern}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-all"
              >
                Add
              </button>
            </div>

            {/* Pattern List */}
            <div className="bg-gray-900 rounded-lg p-3 max-h-48 overflow-y-auto">
              {capability.possibilities.length === 0 ? (
                <p className="text-gray-500 text-xs text-center py-4">
                  No jump patterns defined. Add a pattern above.
                </p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {capability.possibilities.map(([dx, dy], i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-gray-800 px-3 py-2 rounded border border-gray-700 hover:border-purple-500/50 transition-colors group"
                    >
                      <span className="text-white text-sm font-mono">
                        ({dx},{dy})
                      </span>
                      <button
                        onClick={() => handleRemoveLeapPattern(i)}
                        className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Enter relative coordinates like "2,1" (2 right, 1 forward).
              Negative values go left/backward.
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={onSave}
          className="flex-1 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl"
        >
          {isEditing ? "💾 Update" : "✓ Add"}
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
