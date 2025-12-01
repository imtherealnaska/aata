use serde::{Deserialize, Serialize};

/// thinking of chess first
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum GameError {
    OutOfBounds { x: u8, y: u8 },
    NotYourTurn { current_player: String },
    NotYourPiece { owner: String },
    DestinationOccupiedBySelf {x : u8 , y : u8}, // cant capture your own piece
    ViolatesRule(String),
    EmptySource { x: u8, y: u8 },
}
