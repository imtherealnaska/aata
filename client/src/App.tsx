import { useState } from "react";
import { useGameSocket } from "./useGameSocket";

// Helper to create a Checkerboard pattern
const isBlackSquare = (x: number, y: number) => (x + y) % 2 === 1;

// Helper to get piece emoji
const getPieceEmoji = (pieceType: string) => {
  const pieces: Record<string, string> = {
    "Pawn": "♟",
    "Rook": "♜",
    "Knight": "♞",
    "Bishop": "♝",
    "Queen": "♛",
    "King": "♚",
  };
  return pieces[pieceType] || pieceType[0];
};

function App() {
  const { isConnected, messages, joinGame, sendMove, gameState } = useGameSocket();
  const [name, setName] = useState("");
  const [hasJoined, setHasJoined] = useState(false);

  // Local selection state (Start of a move)
  const [selected, setSelected] = useState<[number, number] | null>(null);

  // --- RENDERING ---

  // 1. LOBBY VIEW
  if (!hasJoined) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <h1 className="text-4xl font-bold mb-8">Consensus Game</h1>
        <div className="flex gap-4">
          <input
            type="text"
            className="px-4 py-2 text-black rounded"
            placeholder="Enter Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && isConnected && name) {
                joinGame(name);
                setHasJoined(true);
              }
            }}
          />
          <button
            className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-500 disabled:opacity-50"
            disabled={!isConnected || !name}
            onClick={() => {
              joinGame(name);
              setHasJoined(true);
            }}
          >
            {isConnected ? "Join Game" : "Connecting..."}
          </button>
        </div>
      </div>
    );
  }

  // 2. GAME VIEW
  return (
    <div className="min-h-screen bg-gray-800 text-white flex gap-8 p-8">

      {/* LEFT: Game Board */}
      <div className="flex flex-col items-center">
        <div className="mb-4 text-xl">
          Status: <span className={isConnected ? "text-green-400" : "text-red-400"}>
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>

        {gameState && (
          <div className="mb-4 text-lg">
            Current Turn: <span className="text-yellow-400 font-bold">
              {gameState.current_turn}
            </span>
          </div>
        )}

        {/* THE GRID */}
        <div className="border-4 border-gray-600 bg-gray-700">
          {/* We map 8 rows (y) */}
          {Array.from({ length: 8 }).map((_, y) => (
            <div key={y} className="flex">
              {/* We map 8 cols (x) */}
              {Array.from({ length: 8 }).map((_, x) => {

                // Determine piece at this square
                const piece = gameState?.board[y]?.[x];

                // Styling logic
                const isSelected = selected?.[0] === x && selected?.[1] === y;
                const bgClass = isSelected
                  ? "bg-yellow-500" // Highlight selected
                  : isBlackSquare(x, y) ? "bg-gray-600" : "bg-gray-400"; // Checkerboard

                return (
                  <div
                    key={`${x}-${y}`}
                    className={`w-16 h-16 flex items-center justify-center cursor-pointer transition-colors ${bgClass} hover:opacity-80`}
                    onClick={() => {
                      if (selected) {
                        // If already selected, this click is the DESTINATION
                        sendMove(selected, [x, y]);
                        setSelected(null); // Reset
                      } else {
                        // This click is the SOURCE
                        // Only select if there's a piece
                        if (piece) {
                          setSelected([x, y]);
                        }
                      }
                    }}
                  >
                    {/* Render Piece or Empty */}
                    {piece ? (
                      <span className="text-3xl font-bold select-none">
                        {getPieceEmoji(piece.piece_type)}
                      </span>
                    ) : (
                      <span className="text-gray-500 text-xs select-none opacity-50">
                        {x},{y}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="mt-4 text-sm text-gray-400">
          {selected
            ? `Selected: (${selected[0]}, ${selected[1]}). Click destination to move.`
            : "Click a piece to select, then click destination to move."
          }
        </div>
      </div>

      {/* RIGHT: Logs */}
      <div className="w-80 bg-gray-900 p-4 rounded h-[600px] overflow-y-auto flex flex-col">
        <h3 className="font-bold border-b border-gray-700 mb-2 pb-2 sticky top-0 bg-gray-900">
          Server Logs
        </h3>
        <div className="flex-1 space-y-1">
          {messages.length === 0 ? (
            <div className="text-sm text-gray-500 italic">Waiting for events...</div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className="text-sm font-mono text-green-300 break-words">
                <span className="text-gray-500">&gt;</span> {msg}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
