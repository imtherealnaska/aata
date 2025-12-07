use axum::{
    Router,
    extract::{
        State,
        ws::{Message, WebSocket, WebSocketUpgrade},
    },
    response::IntoResponse,
    routing::get,
};
use futures::{sink::SinkExt, stream::StreamExt};
use serde::Deserialize;
use serde::Serialize;
use tokio::sync::{broadcast, mpsc, oneshot};

mod game_loop;
use game_loop::{Command, GameLoop};

#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "type", content = "payload")]
pub enum ClientMessage {
    #[serde(rename = "join")]
    Join { name: String },
    #[serde(rename = "move")]
    Move { from: (u8, u8), to: (u8, u8) },
    #[serde(rename = "propose_rule")]
    ProposeRule { rule: core::rules::PieceRule },
    #[serde(rename = "spawn")]
    Spawn { name: String, x: u8, y: u8 },
}

#[derive(Clone)]
pub struct AppState {
    tx: mpsc::Sender<Command>,
    broadcast_tx: broadcast::Sender<String>,
}

#[tokio::main]
async fn main() {
    // mpsc : Many connections one game loop
    let (tx, rx) = mpsc::channel(100);
    // broadcasr: one game loop -> many conn
    let (broadcast_tx, _) = broadcast::channel(100);

    // gameloop actor
    let mut game_loop = GameLoop::new(rx, broadcast_tx.clone());

    tokio::spawn(async move { game_loop.run().await });

    let app_state = AppState { tx, broadcast_tx };

    let app = Router::new()
        .route("/ws", get(websocket_handler))
        .with_state(app_state);

    let addr = std::net::SocketAddr::from(([127, 0, 0, 1], 3000));
    println!("Listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap()
}

async fn websocket_handler(
    ws: WebSocketUpgrade,
    State(state): State<AppState>,
) -> impl IntoResponse {
    ws.on_upgrade(|socket| handle_socket(socket, state))
}

async fn handle_socket(socket: WebSocket, state: AppState) {
    let (mut sender, mut receiver) = socket.split();
    let mut broadcast_rx = state.broadcast_tx.subscribe();

    let mut send_task = tokio::spawn(async move {
        while let Ok(msg) = broadcast_rx.recv().await {
            // Serialise a structu here
            if sender
                .send(axum::extract::ws::Message::Text(msg.into()))
                .await
                .is_err()
            {
                break;
            }
        }
    });

    let tx = state.tx.clone();
    let mut recv_tasl = tokio::spawn(async move {
        // Store player_id for this connection
        // also the session ID , because player_id is SESSIONID
        let mut player_id: Option<String> = None;

        while let Some(Ok(msg)) = receiver.next().await {
            if let Message::Text(text) = msg {
                match serde_json::from_str::<ClientMessage>(&text) {
                    Ok(client_msg) => match client_msg {
                        ClientMessage::Join { name } => {
                            let (resp_tx, resp_rx) = oneshot::channel();
                            let cmd = Command::Join {
                                player_name: name.clone(),
                                response: resp_tx,
                            };

                            if tx.send(cmd).await.is_err() {
                                println!("Failed to send command to game loop");
                                break;
                            }

                            match resp_rx.await {
                                Ok(Ok(pid)) => {
                                    println!("Authenticated as {}", pid.0);
                                    player_id = Some(pid.0.clone());
                                }
                                Ok(Err(e)) => {
                                    println!("Join error: {:?}", e);
                                }
                                Err(e) => {
                                    println!("Response channel error: {:?}", e);
                                }
                            }
                        }
                        ClientMessage::Move { from, to } => {
                            println!("Processing Move request: {:?} -> {:?}", from, to);
                            if let Some(pid) = &player_id {
                                let (resp_tx, resp_rx) = oneshot::channel();
                                let cmd = Command::MakeMove {
                                    player_id: pid.clone(),
                                    from,
                                    to,
                                    response: resp_tx,
                                };

                                if tx.send(cmd).await.is_err() {
                                    println!("Failed to send move command to game loop");
                                    break;
                                }

                                match resp_rx.await {
                                    Ok(Ok(())) => {
                                        println!("Move successful: {:?} -> {:?}", from, to);
                                    }
                                    Ok(Err(e)) => {
                                        println!("Move error: {:?}", e);
                                    }
                                    Err(e) => {
                                        println!("Response channel error: {:?}", e);
                                    }
                                }
                            } else {
                                println!("Move request without joining first");
                            }
                        }
                        ClientMessage::ProposeRule { rule } => {
                            if let Some(pid) = &player_id {
                                let (resp_tx, resp_rx) = oneshot::channel();

                                let cmd = Command::ProposeRule {
                                    player_id: pid.clone(),
                                    rule: rule.clone(),
                                    response: resp_tx,
                                };

                                if tx.send(cmd).await.is_err() {
                                    break;
                                }

                                match resp_rx.await {
                                    Ok(Ok(())) => println!("Rule propposed: {}", rule.name),
                                    Ok(Err(e)) => println!("Rule rejected: {:?}", e),
                                    Err(_) => println!("Channel closed"),
                                }
                            } else {
                                println!("Ignored proposal from this socket");
                            }
                        }
                        ClientMessage::Spawn { name, x, y } => {
                            if let Some(pid) = &player_id {
                                let (resp_tx, resp_rx) = oneshot::channel();

                                let cmd = Command::SpawnPiece {
                                    player_id: pid.clone(),
                                    piece_name: name.clone(),
                                    position: (x, y),
                                    response: resp_tx,
                                };

                                if tx.send(cmd).await.is_err() {
                                    break;
                                }

                                match resp_rx.await {
                                    Ok(Ok(())) => println!("spawned propposed: {}", name),
                                    Ok(Err(e)) => println!("spwaned rejected: {:?}", e),
                                    Err(_) => println!("Channel closed"),
                                }
                            } else {
                                println!("spaned error from this socket");
                            }
                        }
                    },
                    Err(e) => {
                        println!("Failed to parse message as ClientMessage: {}", e);
                    }
                }
            }
        }
    });

    // kill the other running one , avoiding sombie taks
    tokio::select! {
        _ = (&mut send_task) => recv_tasl.abort(),
        _ = (&mut recv_tasl) => send_task.abort(),
    }
}
