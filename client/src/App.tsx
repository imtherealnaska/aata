import { useState } from "react";
import { useGameSocket } from "./useGameSocket";
import { isMoveValid } from "./logic/rule-validator";
import { RuleBuilder } from "./components/RuleBuilder";
import { VoteModal } from "./components/VoteModal";
import type { PieceRule } from "./types/rules";
import { getPieceImageUrl } from "./utils/pieceImages";
import { getCustomIconById } from "./utils/customIcons";

// Helper to create a Checkerboard pattern
const isBlackSquare = (x: number, y: number) => (x + y) % 2 === 1;

function App() {
  const { isConnected, messages, joinGame, sendMove, gameState, proposeRule, spawnPiece, pendingVote, sendVote } = useGameSocket();
  const [name, setName] = useState("");
  const [hasJoined, setHasJoined] = useState(false);

  // Local selection state (Start of a move)
  const [selected, setSelected] = useState<[number, number] | null>(null);

  // Spawn mode state
  const [spawnMode, setSpawnMode] = useState(false);
  const [selectedPieceToSpawn, setSelectedPieceToSpawn] = useState<string>("");

  // Handle piece rule proposals
  const handleProposeRule = (rule: PieceRule) => {
    console.log("Proposing rule:", rule);
    proposeRule(rule);
  };

  // Get valid moves for the selected piece
  const getValidMoves = (fromX: number, fromY: number): Set<string> => {
    if (!gameState) return new Set();

    const piece = gameState.board[fromY]?.[fromX];
    if (!piece) return new Set();

    // Get capabilities from the rules, not from the piece
    const rule = gameState.rules[piece.piece_type];
    if (!rule?.capabilities) return new Set();

    const validMoves = new Set<string>();

    // Check all possible destination squares
    for (let toY = 0; toY < 8; toY++) {
      for (let toX = 0; toX < 8; toX++) {
        const dx = toX - fromX;
        const dy = toY - fromY;

        // Determine forward direction based on player
        const forwardY = gameState.players[0] === piece.owner ? 1 : -1;

        if (isMoveValid(dx, dy, rule.capabilities, forwardY)) {
          validMoves.add(`${toX},${toY}`);
        }
      }
    }

    return validMoves;
  };

  const validMoves = selected ? getValidMoves(selected[0], selected[1]) : new Set<string>();

  // Helper to get piece image URL
  const getPieceImage = (pieceType: string, owner: string): string => {
    const isWhite = gameState?.players[0] === owner;
    const standardPieces = ["Pawn", "Rook", "Knight", "Bishop", "Queen", "King"];
    
    if (standardPieces.includes(pieceType)) {
      return getPieceImageUrl(pieceType, isWhite);
    }

    const rule = gameState?.rules[pieceType];
    if (rule?.symbol) {
      // This is a custom piece, the symbol is the icon id
      return getPieceImageUrl(rule.symbol, isWhite);
    }

    return "";
  };

  // Helper to get piece symbol for custom pieces (fallback only)
  const getPieceSymbol = (pieceType: string): string => {
    const rule = gameState?.rules[pieceType];
    if (rule?.symbol) {
        const customIcon = getCustomIconById(rule.symbol);
        if (customIcon) {
            return customIcon.svg;
        }
        return rule.symbol; // Fallback to symbol for standard pieces
    }
    return pieceType[0] || "?";
  };

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
  const isMyTurn = gameState?.current_turn === name;

  // Debug logging
  console.log("App render - pendingVote:", pendingVote);

  return (
    <>
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="flex flex-col gap-3 items-center">
      {/* Player Info Header */}
      <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 flex items-center justify-between w-full max-w-5xl">
        <div className="flex items-center gap-3">
          <span className="font-bold text-blue-400">{name}</span>
          <span className="text-xs">
            <span className={isConnected ? "text-green-400" : "text-red-400"}>
              {isConnected ? "● Connected" : "● Disconnected"}
            </span>
          </span>
        </div>
        {gameState && (
          <div className="flex items-center gap-3">
            <span className="text-sm">
              Turn: <span className="text-yellow-400 font-bold">{gameState.current_turn}</span>
            </span>
            {isMyTurn && (
              <span className="bg-green-600 px-3 py-1 rounded text-sm font-bold">YOUR TURN</span>
            )}
          </div>
        )}
      </div>

      {/* Doomsday Clock */}
      {gameState && (
        <div className="bg-red-900 bg-opacity-30 p-3 rounded-lg border border-red-700 w-full max-w-5xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⏰</span>
              <span className="font-bold">Doomsday Clock</span>
            </div>
            <span className="text-lg font-bold">
              {gameState.disagreement_count} / {gameState.max_disagreements}
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="h-full bg-red-600 rounded-full transition-all"
              style={{
                width: `${(gameState.disagreement_count / gameState.max_disagreements) * 100}%`
              }}
            />
          </div>
        </div>
      )}

      <div className="flex gap-6 w-full max-w-6xl">
        {/* LEFT: Game Board */}
        <div className="flex flex-col">

        {/* Player Status Cards */}
        {gameState && (
          <div className="mb-2 flex gap-2" style={{ width: '768px' }}>
            {gameState.players.map((player, idx) => {
              const isThisPlayer = player === name;
              const isPlayerTurn = player === gameState.current_turn;
              return (
                <div
                  key={idx}
                  className={`flex-1 p-2 rounded border text-center ${
                    isPlayerTurn
                      ? "border-yellow-400 bg-yellow-900 bg-opacity-20"
                      : "border-gray-700 bg-gray-800"
                  }`}
                >
                  <div className="text-sm font-bold">
                    {isThisPlayer ? "YOU" : "OPP"}
                  </div>
                  <div className="text-xs text-gray-400 truncate">{player}</div>
                  {isPlayerTurn && (
                    <div className="text-yellow-400">▶</div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* THE GRID */}
        <div className="border-4 border-amber-900 bg-amber-900 inline-block shadow-2xl">
          {/* We map 8 rows (y) */}
          {Array.from({ length: 8 }).map((_, y) => (
            <div key={y} className="flex" style={{ height: '96px' }}>
              {/* We map 8 cols (x) */}
              {Array.from({ length: 8 }).map((_, x) => {

                // Determine piece at this square
                const piece = gameState?.board[y]?.[x];

                // Styling logic
                const isSelected = selected?.[0] === x && selected?.[1] === y;
                const isValidMove = validMoves.has(`${x},${y}`);

                let bgClass = "";
                if (isSelected) {
                  bgClass = "bg-yellow-400"; // Bright yellow for selected
                } else if (isValidMove) {
                  bgClass = isBlackSquare(x, y)
                    ? "bg-green-600 opacity-90" // Dark green on dark squares
                    : "bg-green-400 opacity-90"; // Light green on light squares
                } else {
                  // Classic chess board colors
                  bgClass = isBlackSquare(x, y)
                    ? "bg-amber-800" // Dark brown squares
                    : "bg-amber-100"; // Light cream squares
                }

                return (
                  <div
                    key={`${x}-${y}`}
                    className={`flex items-center justify-center cursor-pointer border border-amber-900 ${bgClass} hover:brightness-105 transition-all`}
                    style={{ width: '96px', height: '96px', minWidth: '96px', minHeight: '96px' }}
                    onClick={() => {
                      if (spawnMode && selectedPieceToSpawn) {
                        // Spawn mode: place a piece at the clicked square
                        spawnPiece(selectedPieceToSpawn, x, y);
                        setSpawnMode(false);
                        setSelectedPieceToSpawn("");
                      } else if (selected) {
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
                      (() => {
                        const imageUrl = getPieceImage(piece.piece_type, piece.owner);
                        return imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={piece.piece_type}
                            className="w-20 h-20 select-none drop-shadow-lg"
                            draggable={false}
                          />
                        ) : (
                          <div
                            className="w-20 h-20 select-none drop-shadow-lg"
                            dangerouslySetInnerHTML={{ __html: getPieceSymbol(piece.piece_type) }}
                          />
                        );
                      })()
                    ) : isValidMove ? (
                      <div className="w-4 h-4 bg-white rounded-full shadow-lg border-2 border-gray-800" />
                    ) : (
                      <span className="text-amber-700 text-xs select-none opacity-30 font-mono">
                        {x},{y}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="mt-2 text-xs text-gray-400" style={{ width: '768px' }}>
          {spawnMode ? (
            <span>
              🎯 Spawn "{selectedPieceToSpawn}"
              <button
                onClick={() => {
                  setSpawnMode(false);
                  setSelectedPieceToSpawn("");
                }}
                className="ml-2 text-red-400 hover:text-red-300"
              >
                [Cancel]
              </button>
            </span>
          ) : selected ? (
            <span>
              Selected ({selected[0]}, {selected[1]}) • {validMoves.size} moves
            </span>
          ) : (
            <span>Click piece to select</span>
          )}
        </div>
      </div>

        {/* RIGHT: Logs */}
        <div className="w-80 bg-gray-800 p-3 rounded-lg border border-gray-700 flex flex-col" style={{ height: '788px' }}>
          <h3 className="text-sm font-bold border-b border-gray-700 mb-2 pb-2">
            Server Logs
          </h3>
          <div className="flex-1 overflow-y-auto space-y-1">
            {messages.length === 0 ? (
              <div className="text-xs text-gray-500">No events</div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className="text-xs font-mono text-green-400 break-words">
                  &gt; {msg}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MIDDLE: Spawn Panel */}
      {gameState && Object.keys(gameState.rules).length > 0 && (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 w-full max-w-4xl">
          <h3 className="font-bold mb-3">Spawn Pieces</h3>
          <div className="flex flex-wrap gap-2">
            {Object.keys(gameState.rules).map((pieceName) => (
              <button
                key={pieceName}
                onClick={() => {
                  setSpawnMode(true);
                  setSelectedPieceToSpawn(pieceName);
                  setSelected(null);
                }}
                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                  selectedPieceToSpawn === pieceName && spawnMode
                    ? "bg-purple-600 text-white"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                {(() => {
                  const imageUrl = getPieceImage(pieceName, name);
                  return imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={pieceName}
                      className="w-6 h-6 inline-block"
                      draggable={false}
                    />
                  ) : (
                    <div
                      className="w-6 h-6 inline-block"
                      dangerouslySetInnerHTML={{ __html: getPieceSymbol(pieceName) }}
                    />
                  );
                })()}
                <span>{pieceName}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* BOTTOM: Rule Builder */}
      <div className="flex justify-center">
        <RuleBuilder onPropose={handleProposeRule} />
      </div>
      </div>

    </div>

      {/* Vote Modal - rendered outside main container for proper overlay */}
      {pendingVote ? (
        <>
          {console.log("RENDERING VoteModal - pendingVote exists:", pendingVote)}
          <VoteModal
            proposerName={pendingVote.proposer_name}
            rule={pendingVote.rule}
            onVote={(accept) => {
              sendVote(accept);
            }}
          />
        </>
      ) : (
        console.log("NOT rendering VoteModal - pendingVote is null")
      )}
    </>
  );
}

export default App;
