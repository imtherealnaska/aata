import type { PieceRule } from "../types/rules";

interface VoteModalProps {
  proposerName: string;
  rule: PieceRule;
  onVote: (accept: boolean) => void;
}

export function VoteModal({ proposerName, rule, onVote }: VoteModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-600 max-w-md w-full shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-2">Proposal from {proposerName}</h3>

        <div className="bg-gray-900 p-4 rounded mb-6 border border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <span className="text-2xl">{rule.symbol}</span>
            <span className="font-bold text-blue-400">{rule.name}</span>
          </div>
          <div className="text-sm text-gray-400">
            {rule.capabilitites.length} capability{rule.capabilitites.length !== 1 ? 's' : ''} defined.
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
