pub mod errors;

use std::array;

use serde::Serialize;

use crate::errors::GameError;

/*
idea is to use type system a bit more , so (id , type) should not be jumbled
*/
#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct PlayerId(pub String);

#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct PieceType(pub String);

#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct Piece {
    pub piece_type: PieceType,
    pub owner: PlayerId,
}

pub type Board = [[Option<Piece>; 8]; 8];

#[derive(Serialize)]
pub struct GameState {
    pub board: Board,
    #[serde(rename = "current_turn")]
    pub turn: PlayerId,
    pub players: (PlayerId, PlayerId),
}

impl GameState {
    pub fn new(player1: PlayerId, player2: PlayerId) -> Self {
        let mut board: Board = array::from_fn(|_| array::from_fn(|_| None));

        (0..8).for_each(|i| {
            board[1][i] = Some(Piece {
                piece_type: PieceType("Pawn".into()),
                owner: player1.clone(),
            });
            board[6][i] = Some(Piece {
                piece_type: PieceType("Pawn".into()),
                owner: player2.clone(),
            });
        });

        GameState {
            board,
            turn: player1.clone(),
            players: (player1.clone(), player2),
        }
    }

    pub fn apply_move(
        &mut self,
        player_id: &PlayerId,
        from: (u8, u8),
        to: (u8, u8),
    ) -> Result<(), GameError> {
        if from.0 > 7 || from.1 > 7 {
            return Err(GameError::OutOfBounds {
                // should probably have this as a Point(u8,u8)
                x: from.0,
                y: from.1,
            });
        }
        if to.0 > 7 || to.1 > 7 {
            return Err(GameError::OutOfBounds { x: to.0, y: to.1 });
        }

        // Check if it's the player's turn
        if player_id != &self.turn {
            return Err(GameError::NotYourTurn {
                current_player: self.turn.0.clone(),
            });
        }

        // what if , there is no piece at ( x , y )
        let piece = match &self.board[from.1 as usize][from.0 as usize] {
            Some(p) => p,
            None => {
                return Err(GameError::EmptySource {
                    x: from.0,
                    y: from.1,
                });
            }
        };

        if piece.owner != self.turn {
            return Err(GameError::NotYourTurn {
                current_player: self.turn.0.clone(),
            });
        }

        if let Some(dest_piece) = &self.board[to.1 as usize][to.0 as usize]
            && dest_piece.owner == self.turn
        {
            return Err(GameError::DestinationOccupiedBySelf { x: to.0, y: to.1 });
        }

        //capture
        self.board[to.1 as usize][to.0 as usize] =
            self.board[from.1 as usize][from.0 as usize].take();

        self.turn = if self.turn == self.players.1 {
            self.players.0.clone()
        } else {
            self.players.1.clone()
        };
        Ok(())
    }
}
