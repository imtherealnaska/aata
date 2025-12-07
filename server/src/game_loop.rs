use core::GameState;
use core::{Board, PlayerId, errors::GameError};
use tokio::sync::{broadcast, mpsc, oneshot};
use uuid::Uuid;

pub enum Command {
    MakeMove {
        player_id: String,
        from: (u8, u8),
        to: (u8, u8),
        response: oneshot::Sender<Result<(), GameError>>,
    },
    GetState {
        response: oneshot::Sender<GameStateSnapShot>,
    },
    Join {
        player_name: String,
        response: oneshot::Sender<Result<PlayerId, JoinError>>,
    },
    ProposeRule {
        player_id: String,
        rule: core::rules::PieceRule,
        response: oneshot::Sender<Result<(), GameError>>,
    },
    SpawnPiece {
        player_id: String,
        piece_name: String,
        position: (u8, u8),
        response: oneshot::Sender<Result<(), GameError>>,
    },
    CastVote {
        player_id: String,
        vote: bool,
        response: oneshot::Sender<Result<(), GameError>>,
    },
}

// Should be moved to server
#[derive(Clone)]
pub struct GameStateSnapShot {
    pub board: Board,
    pub current_turn: PlayerId,
    pub player1: PlayerId,
    pub player2: PlayerId,
    pub status: GameStatus,
}

// Should be moved to server
#[derive(Clone)]
pub enum GameStatus {
    WaitingForPlayers, // game is yet to start
    InProgress,        //
    Finished { winner: Option<PlayerId> },
}

#[derive(Debug)]
pub enum JoinError {
    GameFull,
    NameTaken,
    GameAlreadyStarted,
}

pub struct GameLoop {
    cmd_rx: mpsc::Receiver<Command>,
    event_tx: broadcast::Sender<String>,
    game: Option<GameState>,
    players: Vec<(String, PlayerId)>,
    status: GameStatus,
    pending_proposal: Option<(String, core::rules::PieceRule)>,
}

impl GameLoop {
    pub fn new(cmd_rx: mpsc::Receiver<Command>, event_tx: broadcast::Sender<String>) -> Self {
        Self {
            cmd_rx,
            event_tx,
            game: None,
            players: Vec::new(),
            status: GameStatus::WaitingForPlayers,
            pending_proposal: None,
        }
    }

    pub async fn run(&mut self) {
        while let Some(cmd) = self.cmd_rx.recv().await {
            match cmd {
                Command::MakeMove {
                    player_id,
                    from,
                    to,
                    response,
                } => {
                    let result = self.handle_move(&player_id, from, to).await;
                    let _ = response.send(result);
                }
                Command::GetState { response } => {
                    let snapshot = self.get_snapshot();
                    let _ = response.send(snapshot);
                }
                Command::Join {
                    player_name,
                    response,
                } => {
                    let result = self.handle_join(player_name).await;
                    let _ = response.send(result);
                }
                Command::ProposeRule {
                    player_id,
                    rule,
                    response,
                } => {
                    let result = self.handle_propose_rule(player_id, rule).await;
                    response.send(result);
                }
                Command::SpawnPiece {
                    player_id,
                    piece_name,
                    position,
                    response,
                } => {
                    if let Some(game) = &mut self.game {
                        if !game.rules.contains_key(&piece_name) {
                            let _ = response
                                .send(Err(GameError::ViolatesRule("Rule doest not exist".into())));
                        } else {
                            game.board[position.1 as usize][position.0 as usize] =
                                Some(core::Piece {
                                    piece_type: core::PieceType(piece_name),
                                    owner: core::PlayerId(player_id),
                                });
                            self.broadcast_state();
                            let _ = response.send(Ok(()));
                        }
                    }
                }
                Command::CastVote {
                    player_id,
                    vote,
                    response,
                } => {
                    let result = self.handle_vote(player_id, vote).await;
                    let _ = response.send(result);
                }
            }
        }
    }

    async fn handle_move(
        &mut self,
        player_id: &str,
        from: (u8, u8),
        to: (u8, u8),
    ) -> Result<(), GameError> {
        let game = self.game.as_mut().ok_or(GameError::GameNotStarted)?;

        let pid = self
            .players
            .iter()
            .find(|(_, id)| id.0 == player_id)
            .map(|(_, id)| id)
            .ok_or(GameError::InvalidPlayer)?;

        game.apply_move(pid, from, to)?;
        // sendin the board
        self.broadcast_state();
        Ok(())
    }

    fn get_snapshot(&self) -> GameStateSnapShot {
        match &self.game {
            Some(game) => GameStateSnapShot {
                board: game.board.clone(),
                current_turn: game.turn.clone(),
                player1: game.players.0.clone(),
                player2: game.players.1.clone(),
                status: self.status.clone(),
            },
            // return empty state if game not started
            None => GameStateSnapShot {
                board: Board::default(),
                current_turn: PlayerId("".to_string()),
                player1: PlayerId("".to_string()),
                player2: PlayerId("".to_string()),
                status: self.status.clone(),
            },
        }
    }

    async fn handle_join(&mut self, player_name: String) -> Result<PlayerId, JoinError> {
        if matches!(
            &self.status,
            GameStatus::InProgress | GameStatus::Finished { .. }
        ) {
            return Err(JoinError::GameAlreadyStarted);
        }

        // if full
        if self.players.len() >= 2 {
            return Err(JoinError::GameFull);
        }

        if self.players.iter().any(|(name, _)| name == &player_name) {
            return Err(JoinError::NameTaken);
        }

        let raw_id = Uuid::new_v4().to_string();
        let player_id = PlayerId(raw_id);

        self.players.push((player_name.clone(), player_id.clone()));
        println!(
            "Player '{}' joined. Total players: {}",
            player_name,
            self.players.len()
        );

        if self.players.len() == 2 {
            let p1_id = self.players[0].1.clone();
            let p2_id = self.players[1].1.clone();

            self.game = Some(GameState::new(p1_id, p2_id));

            self.status = GameStatus::InProgress;

            println!(
                "Game starting! Player {} vs Player {}",
                self.players[0].0, self.players[1].0
            );
            println!("Player {} joined, broadcasting state...", player_name);
            self.broadcast_state();
        } else {
            let event = format!("Player {} joined. Waiting for players ", player_name);
            let _ = self.event_tx.send(event);
        }
        Ok(player_id)
    }

    fn broadcast_state(&self) {
        if let Some(game) = &self.game {
            let state_json = serde_json::to_string(game).unwrap();
            let msg = format!(r#"{{"type":"state","payload":{}}}"#, state_json);
            println!("Broadcasting state: {}", msg);
            let _ = self.event_tx.send(msg);
        }
    }

    async fn handle_propose_rule(
        &mut self,
        player_id: String,
        rule: core::rules::PieceRule,
    ) -> Result<(), GameError> {
        self.pending_proposal = Some((player_id.clone(), rule.clone()));

        let rule_json = serde_json::to_string(&rule).unwrap();

        let msg = format!(
            r#"{{ "type": "vote_requested", "payload": {{ "proposer_id": "{}", "rule": {} }} }}"#,
            player_id, rule_json
        );

        let _ = self.event_tx.send(msg);
        println!("Vote started for rule : {:?}", rule);

        Ok(())
    }

    async fn handle_vote(&mut self, voter_id: String, accept: bool) -> Result<(), GameError> {
        let (proposer_id, rule) = self
            .pending_proposal
            .as_ref()
            .ok_or(GameError::ViolatesRule("no vote in progress".into()))?;

        // you proposed m, then implicit yes vote
        if &voter_id == proposer_id {
            return Err(GameError::ViolatesRule(
                "You cannot vote on your own proposal".into(),
            ));
        }

        if accept {
            if let Some(game) = &mut self.game {
                println!("Rule accepted : {}", rule.name);
                game.rules.insert(rule.name.clone(), rule.clone());
                self.pending_proposal = None;
                self.broadcast_state();
            }
        } else {
            println!("Rejected rule : {}", rule.name);
            self.pending_proposal = None;
            let _ = self
                .event_tx
                .send(r#"{"type" : "vote_rejected"  , "payload" : "{}"}"#.to_string());
        }
        Ok(())
    }
}
