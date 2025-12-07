/**
 * CapabilityEditor Component
 * Provides UI for configuring both Slide and Leap movement capabilities
 */

import { useState } from "react";
import type { MovementCap, SlidePattern } from "../types/rules";
import { isSlideCapability, isLeapCapability, createSlideCapability, createLeapCapability } from "../types/rules";

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
  const [capType, setCapType] = useState<"slide" | "leap">(
    isSlideCapability(capability) ? "slide" : "leap"
  );

  // Leap editor state
  const [leapInput, setLeapInput] = useState("");

  const handleTypeChange = (newType: "slide" | "leap") => {
    setCapType(newType);
    if (newType === "slide") {
      onChange(createSlideCapability("linear", 1, false, false));
    } else {
      onChange(createLeapCapability([]));
    }
  };

  const handleAddLeapPattern = () => {
    if (!isLeapCapability(capability)) return;

    // Parse input like "2,1" or "2 1" or "(2,1)"
    const cleaned = leapInput.replace(/[()]/g, "").trim();
    const parts = cleaned.split(/[,\s]+/).map((s) => parseInt(s.trim(), 10));

    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      const [dx, dy] = parts;
      const newPattern: [number, number] = [dx, dy];

      // Check if pattern already exists
      const exists = capability.leap.possibilities.some(
        ([x, y]) => x === dx && y === dy
      );

      if (!exists) {
        onChange({
          leap: {
            possibilities: [...capability.leap.possibilities, newPattern],
          },
        });
      }
      setLeapInput("");
    }
  };

  const handleRemoveLeapPattern = (index: number) => {
    if (!isLeapCapability(capability)) return;
    onChange({
      leap: {
        possibilities: capability.leap.possibilities.filter((_, i) => i !== index),
      },
    });
  };

  const handleAddKnightPattern = () => {
    if (!isLeapCapability(capability)) return;
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
      leap: {
        possibilities: [...capability.leap.possibilities, ...knightMoves],
      },
    });
  };

  return (
    <div className="mt-5 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-700 p-6 rounded-2xl border-2 border-slate-600/50 animate-fade-in shadow-2xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h4 className="font-bold text-white text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          {isEditing ? "✎ Edit Capability" : "✨ New Capability"}
        </h4>
        <div className="flex gap-2 bg-slate-900/50 p-1 rounded-xl border border-slate-600/50">
          <button
            onClick={() => handleTypeChange("slide")}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              capType === "slide"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105"
                : "bg-transparent text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            → Slide
          </button>
          <button
            onClick={() => handleTypeChange("leap")}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              capType === "leap"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30 scale-105"
                : "bg-transparent text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            ⇝ Leap
          </button>
        </div>
      </div>

      {isSlideCapability(capability) ? (
        <div className="flex flex-col gap-5">
          {/* Pattern Selection */}
          <div>
            <label className="block text-sm text-slate-300 mb-3 font-semibold flex items-center gap-2">
              <span className="text-blue-400">📐</span>
              Movement Pattern
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(["linear", "diagonal", "omni"] as SlidePattern[]).map((p) => (
                <button
                  key={p}
                  onClick={() => onChange({ slide: { ...capability.slide, pattern: p } })}
                  className={`px-4 py-4 rounded-xl text-sm font-semibold transition-all hover:scale-105 ${
                    capability.slide.pattern === p
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-400"
                      : "bg-slate-900/70 text-slate-400 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600"
                  }`}
                >
                  {p === "linear" && "➕ Linear"}
                  {p === "diagonal" && "✖️ Diagonal"}
                  {p === "omni" && "✨ Omni"}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-3 bg-slate-900/30 px-3 py-2 rounded-lg">
              {capability.slide.pattern === "linear" &&
                "Moves horizontally or vertically (like Rook)"}
              {capability.slide.pattern === "diagonal" &&
                "Moves diagonally (like Bishop)"}
              {capability.slide.pattern === "omni" &&
                "Moves in any direction (like Queen)"}
            </p>
          </div>

          {/* Range Slider */}
          <div>
            <label className="block text-sm text-slate-300 mb-3 font-semibold flex items-center gap-2">
              <span className="text-blue-400">📏</span>
              Range: <span className="text-blue-400">{capability.slide.range === 0 ? "∞ Unlimited" : capability.slide.range}</span>
            </label>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
              <input
                type="range"
                min="0"
                max="8"
                value={capability.slide.range}
                onChange={(e) =>
                  onChange({ slide: { ...capability.slide, range: parseInt(e.target.value) } })
                }
                className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-2 px-1">
                <span className="font-semibold">∞</span>
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
                <span>6</span>
                <span>7</span>
                <span className="font-semibold">8</span>
              </div>
            </div>
          </div>

          {/* Constraints */}
          <div className="flex flex-col gap-3 bg-slate-900/30 p-4 rounded-xl border border-slate-700/30">
            <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer group hover:bg-slate-800/50 p-3 rounded-lg transition-all">
              <input
                type="checkbox"
                checked={capability.slide.only_forward}
                onChange={(e) =>
                  onChange({ slide: { ...capability.slide, only_forward: e.target.checked } })
                }
                className="w-5 h-5 accent-blue-500 cursor-pointer rounded"
              />
              <span className="group-hover:text-white transition-colors">
                <strong className="text-blue-400">Forward Only</strong> <span className="text-slate-500">-</span> Can only move toward opponent
              </span>
            </label>
            <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer group hover:bg-slate-800/50 p-3 rounded-lg transition-all">
              <input
                type="checkbox"
                checked={capability.slide.can_jump}
                onChange={(e) =>
                  onChange({ slide: { ...capability.slide, can_jump: e.target.checked } })
                }
                className="w-5 h-5 accent-blue-500 cursor-pointer rounded"
              />
              <span className="group-hover:text-white transition-colors">
                <strong className="text-purple-400">Can Jump</strong> <span className="text-slate-500">-</span> Can move over other pieces
              </span>
            </label>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {/* Leap Patterns */}
          <div>
            <label className="block text-sm text-slate-300 mb-3 font-semibold flex items-center gap-2">
              <span className="text-purple-400">⚡</span>
              Jump Patterns (relative offsets)
            </label>

            {/* Preset: Knight */}
            <button
              onClick={handleAddKnightPattern}
              className="w-full mb-4 px-5 py-3.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-xl text-sm font-semibold transition-all shadow-lg hover:shadow-purple-500/30 hover:scale-[1.02]"
            >
              ⚡ Add Standard Knight Pattern (8 moves)
            </button>

            {/* Custom Pattern Input */}
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={leapInput}
                onChange={(e) => setLeapInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddLeapPattern()}
                placeholder="e.g., 2,1 or -1,2"
                className="flex-1 bg-slate-900/80 text-white px-5 py-3 rounded-xl border border-slate-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 outline-none text-sm placeholder:text-slate-500 hover:border-slate-500/50"
              />
              <button
                onClick={handleAddLeapPattern}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                Add
              </button>
            </div>

            {/* Pattern List */}
            <div className="bg-slate-900/50 rounded-xl p-4 max-h-52 overflow-y-auto border border-slate-700/50 custom-scrollbar">
              {isLeapCapability(capability) && capability.leap.possibilities.length === 0 ? (
                <p className="text-slate-500 text-xs text-center py-6">
                  No jump patterns defined. Add a pattern above.
                </p>
              ) : isLeapCapability(capability) ? (
                <div className="grid grid-cols-4 gap-2">
                  {capability.leap.possibilities.map(([dx, dy], i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-slate-800/70 px-3 py-2.5 rounded-lg border border-slate-700/50 hover:border-purple-500/50 hover:bg-slate-700 transition-all group"
                    >
                      <span className="text-white text-sm font-mono font-semibold">
                        ({dx},{dy})
                      </span>
                      <button
                        onClick={() => handleRemoveLeapPattern(i)}
                        className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
            <p className="text-xs text-slate-500 mt-3 bg-slate-900/30 px-3 py-2 rounded-lg">
              Enter relative coordinates like "2,1" (2 right, 1 forward).
              Negative values go left/backward.
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 mt-7 pt-6 border-t border-slate-700/50">
        <button
          onClick={onSave}
          className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] text-lg"
        >
          {isEditing ? "💾 Update" : "✓ Add"}
        </button>
        <button
          onClick={onCancel}
          className="px-8 py-4 bg-slate-600 hover:bg-slate-500 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
