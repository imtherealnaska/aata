import { useEffect, useRef, useState } from "react";
import type { ClientMessage, GameState, PieceRule, VoteRequestPayload } from "./types";

const WS_URL = "ws://localhost:3000/ws";

export function useGameSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [pendingVote, setPendingVote] = useState<VoteRequestPayload | null>(null);
  const playerIdRef = useRef<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const voteInProgressRef = useRef<boolean>(false);

  useEffect(() => {
    // 1. Connect on Mount
    const ws = new WebSocket(WS_URL);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("Connected to Rust Server");
      setIsConnected(true);
    };

    ws.onclose = () => {
      console.log("Disconnected");
      setIsConnected(false);
    };

    ws.onmessage = (event) => {
      // 2. Handle Incoming Messages
      console.log("Received message:", event.data);
      try {
        const data = JSON.parse(event.data);
        // If the server sends a State Update
        if (data.type === "state") {
          console.log("Received state update:", data.payload);
          setGameState(data.payload);
          // Only clear pending vote if a vote was in progress (vote completed)
          if (voteInProgressRef.current) {
            console.log("Clearing pending vote - vote was completed");
            setPendingVote(null);
            voteInProgressRef.current = false;
          }
        } else if (data.type === "join_success") {
          // Handle join success and store player_id
          console.log("Join successful, player_id:", data.payload.player_id);
          playerIdRef.current = data.payload.player_id;
        } else if (data.type === "vote_requested") {
          // Handle vote request - only show to non-proposer
          const voteData = data.payload as VoteRequestPayload;
          console.log("Vote requested! proposer_id:", voteData.proposer_id, "my player_id:", playerIdRef.current);
          // Only set pending vote if this player is NOT the proposer
          if (playerIdRef.current && voteData.proposer_id !== playerIdRef.current) {
            console.log("Setting pending vote - I am NOT the proposer");
            console.log("Vote data:", voteData);
            setPendingVote(voteData);
            voteInProgressRef.current = true;
            console.log("After setPendingVote - voteInProgressRef:", voteInProgressRef.current);
          } else {
            console.log("NOT setting pending vote - I AM the proposer or no player_id");
          }        } else if (data.type === "vote_rejected") {
          // Clear pending vote when rejected
          console.log("Vote rejected");
          setPendingVote(null); // Clear modal on result
        } else {
          // It's a system message or event
          const msgText = typeof data.payload === 'string' ? data.payload : JSON.stringify(data);
          setMessages((prev) => [...prev, msgText]);
        }
      } catch {
        // Fallback: It's a raw string message from your current server code
        console.log("Received raw:", event.data);
        setMessages((prev) => [...prev, event.data]);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  // 3. Helper functions to send data safely
  const joinGame = (name: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      const msg: ClientMessage = { type: "join", payload: { name } };
      console.log("Sending join message:", msg);
      socketRef.current.send(JSON.stringify(msg));
    }
  };

  const sendMove = (from: [number, number], to: [number, number]) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      const msg: ClientMessage = { type: "move", payload: { from, to } };
      console.log("Sending move message:", msg);
      socketRef.current.send(JSON.stringify(msg));
    }
  };

  const proposeRule = (rule: PieceRule) => {
    if (socketRef.current?.readyState == WebSocket.OPEN) {
      const msg: ClientMessage = { type: "propose_rule", payload: { rule } };
      socketRef.current.send(JSON.stringify(msg));
    }
  };

  const spawnPiece = (name: string, x: number, y: number) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      const msg: ClientMessage = { type: "spawn", payload: { name, x, y } };
      console.log("Sending spawn message:", msg);
      socketRef.current.send(JSON.stringify(msg));
    }
  };

  const sendVote = (accept: boolean) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      const msg: ClientMessage = { type: "vote", payload: { accept } };
      console.log("Sending vote:", msg);
      socketRef.current.send(JSON.stringify(msg));
      // Don't clear immediately - wait for state update
      // The state update will trigger the clear via voteInProgressRef
    }
  };

  return { isConnected, messages, gameState, pendingVote, joinGame, sendMove, proposeRule, spawnPiece, sendVote };

}
