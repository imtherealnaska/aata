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
          // Don't automatically clear pendingVote on state updates
          // It will be cleared when vote is accepted or rejected
        } else if (data.type === "join_success") {
          // Handle join success and store player_id
          console.log("Join successful, player_id:", data.payload.player_id);
          playerIdRef.current = data.payload.player_id;
        } else if (data.type === "vote_requested") {
          // Handle vote request - only show to non-proposer
          const voteData = data.payload as VoteRequestPayload;
          // Only set pending vote if this player is NOT the proposer
          if (playerIdRef.current && voteData.proposer_id !== playerIdRef.current) {
            setPendingVote(voteData);
          }        } else if (data.type === "vote_rejected") {
          // Clear pending vote when rejected
          console.log("Vote rejected");
          setPendingVote(null); // Clear modal on result
        } else {
          // It's a system message or event
          const msgText = typeof data.payload === 'string' ? data.payload : JSON.stringify(data);
          setMessages((prev) => [...prev, msgText]);
        }
      } catch (e) {
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
      setPendingVote(null); // Optimistically close
    }
  };

  return { isConnected, messages, gameState, pendingVote, joinGame, sendMove, proposeRule, spawnPiece, sendVote };

}
