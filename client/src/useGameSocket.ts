import { useEffect, useRef, useState } from "react";
import type { ClientMessage, GameState, PieceRule } from "./types";

const WS_URL = "ws://localhost:3000/ws";

export function useGameSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [gameState, setGameState] = useState<GameState | null>(null);
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

  return { isConnected, messages, gameState, joinGame, sendMove, proposeRule, spawnPiece };

}
