import type { PieceRule } from "../types/rules";
import { getPieceImageUrl } from "../utils/pieceImages";

interface VoteModalProps {
  proposerName: string; // "Alice"
  rule: PieceRule;
  onVote: (accept: boolean) => void;
}

export function VoteModal({ proposerName, rule, onVote }: VoteModalProps) {
  console.log("VoteModal RENDERING with proposer:", proposerName, "rule:", rule);

  const imageUrl = getPieceImageUrl(rule.name, true);

  return (
    <div
      className="fixed inset-0 bg-red-500 flex items-center justify-center"
      style={{
        zIndex: 99999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <div className="bg-white p-6 rounded-xl border-8 border-yellow-500 max-w-md w-full shadow-2xl">
        <h3 className="text-xl font-bold text-black mb-2">
          Proposal from {proposerName}
        </h3>

        <div className="bg-gray-200 p-4 rounded mb-6 border-4 border-black">
          <div className="flex justify-between items-center mb-2">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={rule.name}
                className="w-12 h-12"
                draggable={false}
              />
            ) : (
              <span className="text-2xl">{rule.symbol}</span>
            )}
            <span className="font-bold text-blue-400">{rule.name}</span>
          </div>
          <div className="text-sm text-gray-400">
            {rule.capabilities.length} capability
            {rule.capabilities.length !== 1 ? "s" : ""} defined.
            {/* You could render the specific capabilities here for review */}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => onVote(false)}
            className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 rounded font-bold transition-colors"
          >
            REJECT
          </button>
          <button
            onClick={() => onVote(true)}
            className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded font-bold transition-colors shadow-lg"
          >
            ACCEPT
          </button>
        </div>
      </div>
    </div>
  );
}
