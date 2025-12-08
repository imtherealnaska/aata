import { useState } from "react";
import { type MovementCap, type PieceRule, createSlideCapability, createLeapCapability, isSlideCapability, isLeapCapability, type SlidePattern } from "../types/rules";
import { customIcons } from "../utils/customIcons";

interface RuleBuilderProps {
  onPropose: (rule: PieceRule) => void;
  initialRule?: PieceRule;
}

export function RuleBuilder({ onPropose, initialRule }: RuleBuilderProps) {
  const [name, setName] = useState(initialRule?.name || "New Piece");
  const [selectedIconId, setSelectedIconId] = useState(initialRule?.symbol || "star");
  const [isRoyal, setIsRoyal] = useState(initialRule?.is_royal || false);

  const initialSlideCap = initialRule?.capabilities.find(isSlideCapability);
  const [canSlide, setCanSlide] = useState(!!initialSlideCap);
  const [slidePattern, setSlidePattern] = useState<"linear" | "diagonal" | "omni">(initialSlideCap?.slide.pattern || "linear");
  const [slideRange, setSlideRange] = useState(initialSlideCap?.slide.range || 1);
  const [slideForwardOnly, setSlideForwardOnly] = useState(initialSlideCap?.slide.only_forward || false);
  const [slideCanJump, setSlideCanJump] = useState(initialSlideCap?.slide.can_jump || false);

  const initialLeapCap = initialRule?.capabilities.find(isLeapCapability);
  const [canLeap, setCanLeap] = useState(!!initialLeapCap);
  const [leapDx, setLeapDx] = useState(initialLeapCap?.leap.possibilities[0]?.[0] || 2);
  const [leapDy, setLeapDy] = useState(initialLeapCap?.leap.possibilities[0]?.[1] || 1);


  const handlePropose = () => {
    const capabilities: MovementCap[] = [];

    if (canSlide) {
      capabilities.push(
        createSlideCapability(slidePattern, slideRange, slideForwardOnly, slideCanJump)
      );
    }

    if (canLeap) {
      capabilities.push(createLeapCapability([[leapDx, leapDy]]));
    }

    if (capabilities.length > 0 && name.trim() && selectedIconId) {
      const rule: PieceRule = {
        name,
        symbol: selectedIconId, // Store the icon ID as the symbol
        capabilities,
        is_royal: isRoyal
      };
      onPropose(rule);

      // Reset form
      setName("New Piece");
      setSelectedIconId("star");
      setIsRoyal(false);
      setCanSlide(false);
      setCanLeap(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 w-full max-w-2xl">
      <h2 className="text-2xl font-bold mb-6 text-blue-400">Create Piece Rule</h2>

      <div className="space-y-4">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Piece Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded focus:border-blue-500 outline-none"
              placeholder="e.g., Knight"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Icon</label>
            <div className="grid grid-cols-5 gap-2 p-2 bg-gray-900 border border-gray-700 rounded-lg">
              {customIcons.map((icon) => (
                <button
                  key={icon.id}
                  onClick={() => setSelectedIconId(icon.id)}
                  className={`p-2 rounded-md transition-all ${
                    selectedIconId === icon.id
                      ? "bg-blue-600 ring-2 ring-blue-400"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                  title={icon.name}
                >
                  <div
                    className="w-8 h-8 mx-auto"
                    dangerouslySetInnerHTML={{ __html: icon.svg }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Royal Piece */}
        <div className="flex items-center gap-2 p-3 bg-gray-900 rounded border border-gray-700">
          <input
            type="checkbox"
            id="royal"
            checked={isRoyal}
            onChange={(e) => setIsRoyal(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="royal" className="font-medium">
            👑 Royal Piece (losing all royal pieces = game over)
          </label>
        </div>

        {/* Slide Capability */}
        <div className="border border-gray-700 rounded p-4 bg-gray-900">
          <div className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              id="canSlide"
              checked={canSlide}
              onChange={(e) => setCanSlide(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="canSlide" className="font-medium text-lg">Slide Movement</label>
          </div>

          {canSlide && (
            <div className="space-y-3 ml-6 mt-3">
              <div>
                <label className="block text-sm mb-1">Pattern</label>
                <select
                  value={slidePattern}
                  onChange={(e) => setSlidePattern(e.target.value as SlidePattern)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded outline-none"
                >
                  <option value="linear">Linear (↑↓←→)</option>
                  <option value="diagonal">Diagonal (⇗⇘⇖⇙)</option>
                  <option value="omni">Omni (all directions)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">
                  Range (0 = unlimited)
                </label>
                <input
                  type="number"
                  min="0"
                  max="7"
                  value={slideRange}
                  onChange={(e) => setSlideRange(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="slideForward"
                  checked={slideForwardOnly}
                  onChange={(e) => setSlideForwardOnly(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="slideForward">Forward only</label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="slideJump"
                  checked={slideCanJump}
                  onChange={(e) => setSlideCanJump(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="slideJump">Can jump over pieces</label>
              </div>
            </div>
          )}
        </div>

        {/* Leap Capability */}
        <div className="border border-gray-700 rounded p-4 bg-gray-900">
          <div className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              id="canLeap"
              checked={canLeap}
              onChange={(e) => setCanLeap(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="canLeap" className="font-medium text-lg">Leap Movement (like Knight)</label>
          </div>

          {canLeap && (
            <div className="space-y-3 ml-6 mt-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">Horizontal (dx)</label>
                  <input
                    type="number"
                    min="-7"
                    max="7"
                    value={leapDx}
                    onChange={(e) => setLeapDx(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Vertical (dy)</label>
                  <input
                    type="number"
                    min="-7"
                    max="7"
                    value={leapDy}
                    onChange={(e) => setLeapDy(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded outline-none"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400">
                Example: Knight = (2,1) or (1,2)
              </p>
            </div>
          )}
        </div>

        {/* Propose Button */}
        <button
          onClick={handlePropose}
          disabled={!name.trim() || !selectedIconId || (!canSlide && !canLeap)}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:opacity-50 px-6 py-3 rounded-lg font-bold transition-all"
        >
          Propose Rule
        </button>
      </div>
    </div>
  );
}
