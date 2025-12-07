/**
 * RuleBuilder Component
 * A comprehensive UI for designing custom chess piece movement rules
 * Aligned with backend implementation in core/src/rules.rs and core/src/lib.rs
 */

import { useState } from "react";
import { describeCapability } from "../logic/rule-validator";
import {
  type MovementCap,
  type PieceRule,
  createSlideCapability,
  isSlideCapability,
} from "../types/rules";
import { CapabilityEditor } from "./CapabilityEditor";
import { PreviewGrid } from "./PreviewGrid";

interface RuleBuilderProps {
  onPropose: (rule: PieceRule) => void;
  initialRule?: PieceRule;
}

const COMMON_SYMBOLS = [
  { value: "♔", label: "♔ White King" },
  { value: "♕", label: "♕ White Queen" },
  { value: "♖", label: "♖ White Rook" },
  { value: "♗", label: "♗ White Bishop" },
  { value: "♘", label: "♘ White Knight" },
  { value: "♙", label: "♙ White Pawn" },
  { value: "♚", label: "♚ Black King" },
  { value: "♛", label: "♛ Black Queen" },
  { value: "♜", label: "♜ Black Rook" },
  { value: "♝", label: "♝ Black Bishop" },
  { value: "♞", label: "♞ Black Knight" },
  { value: "♟", label: "♟ Black Pawn" },
  { value: "custom", label: "Custom Symbol..." },
];

export function RuleBuilder({ onPropose, initialRule }: RuleBuilderProps) {
  const [name, setName] = useState(initialRule?.name || "New Piece");
  const [symbol, setSymbol] = useState(initialRule?.symbol || "♟");
  const [useCustomSymbol, setUseCustomSymbol] = useState(
    !COMMON_SYMBOLS.some((s) => s.value === initialRule?.symbol)
  );
  const [capabilities, setCapabilities] = useState<MovementCap[]>(
    initialRule?.capabilitites || []
  );

  // Editor state
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempCap, setTempCap] = useState<MovementCap>(
    createSlideCapability("linear", 1, false, false)
  );

  // Preview settings
  const [playerPerspective, setPlayerPerspective] = useState<1 | 2>(1);
  const forwardY = playerPerspective === 1 ? 1 : -1;

  // --- ACTIONS ---
  const handleAddCapability = () => {
    if (editingIndex !== null) {
      // Update existing
      const updated = [...capabilities];
      updated[editingIndex] = tempCap;
      setCapabilities(updated);
      setEditingIndex(null);
    } else {
      // Add new
      setCapabilities([...capabilities, tempCap]);
    }
    setIsAdding(false);
    setTempCap(createSlideCapability("linear", 1, false, false));
  };

  const handleEditCapability = (index: number) => {
    setTempCap(capabilities[index]);
    setEditingIndex(index);
    setIsAdding(true);
  };

  const handleRemoveCapability = (index: number) => {
    setCapabilities(capabilities.filter((_, i) => i !== index));
  };

  const handleCancelEdit = () => {
    setIsAdding(false);
    setEditingIndex(null);
    setTempCap(createSlideCapability("linear", 1, false, false));
  };

  const handlePropose = () => {
    const rule: PieceRule = {
      name,
      symbol,
      capabilitites: capabilities,
    };
    onPropose(rule);
  };

  const canPropose =
    capabilities.length > 0 && name.trim() !== "" && symbol.trim() !== "";

  return (
    <div className="flex flex-col gap-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-700/50 w-full max-w-7xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-600/50 pb-6">
        <div className="flex items-center gap-6">
          <div className="text-6xl transform hover:scale-110 transition-transform cursor-default">
            {symbol}
          </div>
          <div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Rule Forge
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Design custom piece movement rules with precision
            </p>
          </div>
        </div>
        <div className="flex gap-3 text-xs">
          <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/40 font-semibold shadow-lg backdrop-blur-sm">
            {capabilities.length} Capability
            {capabilities.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* LEFT PANEL: Controls & Configuration */}
        <div className="flex flex-col gap-6">
          {/* Piece Identity */}
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-800/30 rounded-2xl p-6 border border-slate-700/50 shadow-xl backdrop-blur-sm hover:border-slate-600/50 transition-all">
            <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-3">
              <span className="text-2xl">⚙️</span>
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Piece Identity
              </span>
            </h3>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wider font-semibold">
                  Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-900/80 text-white px-5 py-3.5 rounded-xl w-full border border-slate-600/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none transition-all placeholder:text-slate-500 hover:border-slate-500/50"
                  placeholder="e.g., Knight, Super Pawn"
                />
              </div>
              <div className="w-48">
                <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wider font-semibold">
                  Symbol
                </label>
                {!useCustomSymbol ? (
                  <select
                    value={symbol}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "custom") {
                        setUseCustomSymbol(true);
                        setSymbol("");
                      } else {
                        setSymbol(value);
                      }
                    }}
                    className="bg-slate-900/80 text-white px-4 py-3.5 rounded-xl w-full border border-slate-600/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none transition-all hover:border-slate-500/50 cursor-pointer"
                  >
                    {COMMON_SYMBOLS.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        className="bg-slate-800 text-white py-2"
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={symbol}
                      onChange={(e) => setSymbol(e.target.value.slice(0, 2))}
                      className="bg-slate-900/80 text-white px-4 py-3.5 rounded-xl w-full text-center text-3xl border border-slate-600/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none transition-all hover:border-slate-500/50"
                      placeholder="♟"
                      maxLength={2}
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        setUseCustomSymbol(false);
                        setSymbol("♟");
                      }}
                      className="bg-slate-700 hover:bg-slate-600 text-white px-3 rounded-xl transition-all"
                      title="Use dropdown"
                    >
                      ⮐
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Capabilities List */}
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-800/30 rounded-2xl p-6 border border-slate-700/50 flex-1 shadow-xl backdrop-blur-sm hover:border-slate-600/50 transition-all">
            <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-3">
              <span className="text-2xl">📋</span>
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Movement Capabilities
              </span>
            </h3>

            <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {capabilities.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <div className="text-5xl mb-3 opacity-50">🎯</div>
                  <p className="text-sm font-medium">No capabilities defined yet</p>
                  <p className="text-xs mt-2 text-slate-600">
                    Add a capability to get started
                  </p>
                </div>
              ) : (
                capabilities.map((cap, i) => (
                  <div
                    key={i}
                    className={`group flex justify-between items-center bg-slate-900/70 p-5 rounded-xl border transition-all hover:shadow-lg hover:scale-[1.01] ${
                      editingIndex === i
                        ? "border-blue-500 ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/20"
                        : "border-slate-700/50 hover:border-blue-500/50"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {isSlideCapability(cap) ? (
                          <span className="text-blue-400 text-xl font-bold">→</span>
                        ) : (
                          <span className="text-purple-400 text-xl font-bold">⇝</span>
                        )}
                        <span className="text-white font-semibold tracking-wide">
                          {isSlideCapability(cap) ? "Slide" : "Leap"}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 ml-8 leading-relaxed">
                        {describeCapability(cap)}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditCapability(i)}
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 px-4 py-2 rounded-lg transition-all"
                        title="Edit"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => handleRemoveCapability(i)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-4 py-2 rounded-lg transition-all"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {!isAdding ? (
              <button
                onClick={() => setIsAdding(true)}
                className="mt-5 w-full bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white py-4 rounded-xl border-2 border-dashed border-slate-500 hover:border-slate-400 transition-all flex items-center justify-center gap-3 font-semibold shadow-lg hover:shadow-xl hover:scale-[1.01]"
              >
                <span className="text-2xl">+</span>
                <span>Add Movement Capability</span>
              </button>
            ) : (
              <CapabilityEditor
                capability={tempCap}
                onChange={setTempCap}
                onSave={handleAddCapability}
                onCancel={handleCancelEdit}
                isEditing={editingIndex !== null}
              />
            )}
          </div>

          {/* Propose Button */}
          <button
            onClick={handlePropose}
            disabled={!canPropose}
            className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-500 hover:from-emerald-500 hover:via-green-500 hover:to-emerald-400 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white py-5 rounded-2xl font-bold text-lg shadow-2xl transition-all hover:scale-[1.02] hover:shadow-emerald-500/50 disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none"
          >
            <span className="relative z-10">
              {canPropose ? "🚀 PROPOSE RULE" : "⚠️ Complete the rule to propose"}
            </span>
            {canPropose && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            )}
          </button>
        </div>

        {/* RIGHT PANEL: Preview Grid */}
        <div className="flex flex-col gap-6">
          <PreviewGrid
            capabilities={capabilities}
            symbol={symbol}
            forwardY={forwardY}
            playerPerspective={playerPerspective}
            onTogglePerspective={() =>
              setPlayerPerspective(playerPerspective === 1 ? 2 : 1)
            }
          />

          {/* Rule Summary */}
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-800/30 rounded-2xl p-6 border border-slate-700/50 shadow-xl backdrop-blur-sm hover:border-slate-600/50 transition-all">
            <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2">
              <span className="text-lg">📊</span>
              Rule Summary
            </h3>
            <div className="text-sm text-slate-300 space-y-3">
              <div className="flex items-center justify-between bg-slate-900/50 px-4 py-3 rounded-lg">
                <span className="text-slate-500 font-medium">Name:</span>
                <span className="text-white font-semibold">
                  {name || <span className="text-slate-600 italic">(unnamed)</span>}
                </span>
              </div>
              <div className="flex items-center justify-between bg-slate-900/50 px-4 py-3 rounded-lg">
                <span className="text-slate-500 font-medium">Symbol:</span>
                <span className="text-white font-semibold text-2xl">
                  {symbol || <span className="text-slate-600 italic text-sm">(none)</span>}
                </span>
              </div>
              <div className="flex items-center justify-between bg-slate-900/50 px-4 py-3 rounded-lg">
                <span className="text-slate-500 font-medium">Capabilities:</span>
                <span className="text-white font-semibold">
                  {capabilities.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.3);
          border-radius: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.3);
          border-radius: 6px;
          transition: background 0.2s;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.5);
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
