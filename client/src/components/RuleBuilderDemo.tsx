/**
 * Demo page for the RuleBuilder component
 * Shows how to use the RuleBuilder and displays created rules
 */

import { useState } from "react";
import { RuleBuilder } from "./RuleBuilder";
import type { PieceRule, MovementCap } from "../types/rules";
import { describeCapability } from "../logic/rule-validator";
import { isSlideCapability } from "../types/rules";

export function RuleBuilderDemo() {
  const [proposedRules, setProposedRules] = useState<PieceRule[]>([]);
  const [editingRule, setEditingRule] = useState<PieceRule | undefined>();

  const handlePropose = (rule: PieceRule) => {
    console.log("Proposed rule:", rule);
    setProposedRules([...proposedRules, rule]);
    setEditingRule(undefined);
  };

  const handleEdit = (rule: PieceRule, index: number) => {
    setEditingRule(rule);
    // Remove from list while editing
    setProposedRules(proposedRules.filter((_, i) => i !== index));
  };

  const handleDelete = (index: number) => {
    setProposedRules(proposedRules.filter((_, i) => i !== index));
  };

  const handleExportJSON = () => {
    const json = JSON.stringify(proposedRules, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "piece-rules.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            ♟️ Chess Piece Rule Designer
          </h1>
          <p className="text-gray-400 text-lg">
            Create custom chess pieces with unique movement rules
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <span className="px-3 py-1 bg-gray-800 rounded-full">
              Backend-aligned
            </span>
            <span className="px-3 py-1 bg-gray-800 rounded-full">
              Type-safe
            </span>
            <span className="px-3 py-1 bg-gray-800 rounded-full">
              Real-time preview
            </span>
          </div>
        </div>

        {/* Rule Builder */}
        <div className="flex justify-center">
          <RuleBuilder onPropose={handlePropose} initialRule={editingRule} />
        </div>

        {/* Proposed Rules */}
        {proposedRules.length > 0 && (
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-700 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  📚 Proposed Rules ({proposedRules.length})
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Your custom piece definitions
                </p>
              </div>
              <button
                onClick={handleExportJSON}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg font-medium transition-all shadow-lg"
              >
                📥 Export JSON
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {proposedRules.map((rule, index) => (
                <div
                  key={index}
                  className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500/50 transition-all group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{rule.symbol}</div>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {rule.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {rule.capabilitites.length} capability
                          {rule.capabilitites.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(rule, index)}
                        className="text-blue-400 hover:text-blue-300 px-2"
                        title="Edit"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="text-red-400 hover:text-red-300 px-2"
                        title="Delete"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Capabilities */}
                  <div className="space-y-2">
                    {rule.capabilitites.map((cap: MovementCap, capIndex: number) => (
                      <div
                        key={capIndex}
                        className="bg-gray-900 rounded-lg p-3 border border-gray-700"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {isSlideCapability(cap) ? (
                            <span className="text-blue-400">→</span>
                          ) : (
                            <span className="text-purple-400">⇝</span>
                          )}
                          <span className="text-white text-sm font-medium">
                            {isSlideCapability(cap) ? "Slide" : "Leap"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 ml-5">
                          {describeCapability(cap)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* JSON Preview */}
                  <details className="mt-4">
                    <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                      View JSON
                    </summary>
                    <pre className="mt-2 text-xs bg-gray-950 text-gray-300 p-3 rounded overflow-x-auto">
                      {JSON.stringify(rule, null, 2)}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documentation */}
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">
            📖 Quick Guide
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="text-blue-400 font-semibold mb-2">
                Slide Movement
              </h3>
              <ul className="space-y-1 text-gray-400">
                <li>
                  • <strong>Linear:</strong> Horizontal/vertical (Rook-like)
                </li>
                <li>
                  • <strong>Diagonal:</strong> Diagonal only (Bishop-like)
                </li>
                <li>
                  • <strong>Omni:</strong> Any direction (Queen-like)
                </li>
                <li>
                  • <strong>Range:</strong> 0 = unlimited, 1-8 = limited
                </li>
                <li>
                  • <strong>Forward Only:</strong> Restricts to forward movement
                </li>
                <li>
                  • <strong>Can Jump:</strong> Ignores blocking pieces
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-purple-400 font-semibold mb-2">
                Leap Movement
              </h3>
              <ul className="space-y-1 text-gray-400">
                <li>
                  • Define exact jump offsets (x, y)
                </li>
                <li>
                  • Example: (2,1) jumps 2 right, 1 forward
                </li>
                <li>
                  • Negative values for left/backward
                </li>
                <li>
                  • Use preset Knight pattern for L-shapes
                </li>
                <li>
                  • Combine multiple jump patterns
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>
            Built with React + TypeScript | Aligned with Rust backend (core/src/rules.rs)
          </p>
          <p className="mt-1">
            Movement validation mirrors backend logic in core/src/lib.rs
          </p>
        </div>
      </div>
    </div>
  );
}
