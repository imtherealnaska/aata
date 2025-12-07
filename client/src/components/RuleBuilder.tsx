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
} from "../types/rules";
import { CapabilityEditor } from "./CapabilityEditor";
import { PreviewGrid } from "./PreviewGrid";

interface RuleBuilderProps {
  onPropose: (rule: PieceRule) => void;
  initialRule?: PieceRule;
}

export function RuleBuilder({ onPropose, initialRule }: RuleBuilderProps) {
  const [name, setName] = useState(initialRule?.name || "New Piece");
  const [symbol, setSymbol] = useState(initialRule?.symbol || "♟");
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
    <div className="flex flex-col gap-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-600 pb-4">
        <div className="flex items-center gap-4">
          <div className="text-4xl">{symbol}</div>
          <div>
            <h2 className="text-3xl font-bold text-white">Rule Forge</h2>
            <p className="text-sm text-gray-400">
              Design custom piece movement rules
            </p>
          </div>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full border border-blue-500/30">
            {capabilities.length} Capability
            {capabilities.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* LEFT PANEL: Controls & Configuration */}
        <div className="flex flex-col gap-6">
          {/* Piece Identity */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="text-blue-400">⚙️</span> Piece Identity
            </h3>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wide">
                  Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-gray-900 text-white px-4 py-3 rounded-lg w-full border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  placeholder="e.g., Knight, Super Pawn"
                />
              </div>
              <div className="w-24">
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wide">
                  Symbol
                </label>
                <input
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.slice(0, 2))}
                  className="bg-gray-900 text-white px-4 py-3 rounded-lg w-full text-center text-2xl border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  placeholder="♟"
                  maxLength={2}
                />
              </div>
            </div>
          </div>

          {/* Capabilities List */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 flex-1">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="text-green-400">📋</span> Movement Capabilities
            </h3>

            <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {capabilities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🎯</div>
                  <p className="text-sm">No capabilities defined yet</p>
                  <p className="text-xs mt-1">
                    Add a capability to get started
                  </p>
                </div>
              ) : (
                capabilities.map((cap, i) => (
                  <div
                    key={i}
                    className={`flex justify-between items-center bg-gray-900/70 p-4 rounded-lg border transition-all hover:border-blue-500/50 ${
                      editingIndex === i
                        ? "border-blue-500 ring-2 ring-blue-500/20"
                        : "border-gray-700"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {cap.type === "slide" ? (
                          <span className="text-blue-400 text-lg">→</span>
                        ) : (
                          <span className="text-purple-400 text-lg">⇝</span>
                        )}
                        <span className="text-white font-medium">
                          {cap.type === "slide" ? "Slide" : "Leap"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 ml-7">
                        {describeCapability(cap)}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEditCapability(i)}
                        className="text-blue-400 hover:text-blue-300 px-3 py-1 rounded transition-colors"
                        title="Edit"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => handleRemoveCapability(i)}
                        className="text-red-400 hover:text-red-300 px-3 py-1 rounded transition-colors"
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
                className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg border-2 border-dashed border-gray-500 hover:border-gray-400 transition-all flex items-center justify-center gap-2"
              >
                <span className="text-xl">+</span>
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
            className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
          >
            {canPropose ? "🚀 PROPOSE RULE" : "⚠️ Complete the rule to propose"}
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
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
              Rule Summary
            </h3>
            <div className="text-sm text-gray-300 space-y-2">
              <p>
                <span className="text-gray-500">Name:</span>{" "}
                <span className="text-white font-medium">
                  {name || "(unnamed)"}
                </span>
              </p>
              <p>
                <span className="text-gray-500">Symbol:</span>{" "}
                <span className="text-white font-medium text-lg">
                  {symbol || "(none)"}
                </span>
              </p>
              <p>
                <span className="text-gray-500">Capabilities:</span>{" "}
                <span className="text-white font-medium">
                  {capabilities.length}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}
