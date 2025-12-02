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

#[derive(Serialize, Deserialize)]
#[serde(tag = "type", content = "payload")]
pub enum ClientMessage {
    Join { name: String },
    Move { from: (u8, u8), to: (u8, u8) },
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
        while let Some(Ok(msg)) = receiver.next().await {
            if let Message::Text(text) = msg {
                if let Ok(client_msg) = serde_json::from_str::<ClientMessage>(&text) {
                    match client_msg {
                        ClientMessage::Join { name } => {
                            let (resp_tx, resp_rx) = oneshot::channel();
                            let cmd = Command::Join {
                                player_name: name,
                                response: resp_tx,
                            };

                            if tx.send(cmd).await.is_err() {
                                break;
                            }

                            if let Ok(Ok(player_id)) = resp_rx.await {
                                println!("Player joined with ID : {:?}", player_id);
                            }
                        }
                        ClientMessage::Move { from, to } => {
                            // TODO: Need player_id here ,did nt store it
                        }
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
