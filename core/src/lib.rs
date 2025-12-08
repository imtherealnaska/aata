pub mod errors;
pub mod rules;

use std::collections::HashMap;

use serde::Serialize;

use crate::{
    errors::GameError,
    rules::{MovementCap, PieceRule, SlidePattern},
};

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
    pub rules: HashMap<String, PieceRule>,
    pub disagreement_count: u8,
    pub max_disagreements: u8,
}

impl GameState {
    pub fn new(player1: PlayerId, player2: PlayerId) -> Self {
        let mut rules = HashMap::new();

        rules.insert(
            "Pawn".to_string(),
            PieceRule {
                name: "Pawn".to_string(),
                symbol: "P".to_string(),
                capabilities: vec![MovementCap::Slide {
                    pattern: SlidePattern::FrontBack,
                    range: 1,
                    can_jump: false,
                    only_forward: true,
                }],
                is_royal: false,
            },
        );

        rules.insert(
            "Knight".to_string(),
            PieceRule {
                name: "Knight".to_string(),
                symbol: "K".to_string(),
                capabilities: vec![MovementCap::Leap {
                    possibilities: vec![
                        (1, 2), // L shapes
                        (2, 1),
                        (2, -1),
                        (1, -2),
                        (-1, -2),
                        (-2, -1),
                        (-2, 1),
                        (-1, 2),
                    ],
                }],
                is_royal: false,
            },
        );

        rules.insert(
            "Rook".to_string(),
            PieceRule {
                name: "Rook".to_string(),
                symbol: "R".to_string(),
                capabilities: vec![MovementCap::Slide {
                    pattern: SlidePattern::FrontBack,
                    range: 0, // infinite
                    can_jump: false,
                    only_forward: false,
                }],
                is_royal: false,
            },
        );

        rules.insert(
            "King".to_string(),
            PieceRule {
                name: "King".to_string(),
                symbol: "K".to_string(),
                capabilities: vec![MovementCap::Slide {
                    pattern: SlidePattern::FrontBack,
                    range: 1,
                    can_jump: false,
                    only_forward: false,
                }],
                is_royal: true, // King is now a royal piece
            },
        );

        let mut board: Board = std::array::from_fn(|_| std::array::from_fn(|_| None));

        // place the pieces
        (0..8).for_each(|i| {
            board[1][i] = Some(Piece {
                piece_type: PieceType("Pawn".into()),
                owner: player1.clone(),
            });
            if i == 0 || i == 7 {
                board[0][i] = Some(Piece {
                    piece_type: PieceType("Rook".into()),
                    owner: player1.clone(),
                });
            }

            if i == 1 || i == 6 {
                board[0][i] = Some(Piece {
                    piece_type: PieceType("Knight".into()),
                    owner: player1.clone(),
                });
            }

            if i == 4 {
                board[0][i] = Some(Piece {
                    piece_type: PieceType("King".into()),
                    owner: player1.clone(),
                });
            }

            board[6][i] = Some(Piece {
                piece_type: PieceType("Pawn".into()),
                owner: player2.clone(),
            });

            if i == 0 || i == 7 {
                board[7][i] = Some(Piece {
                    piece_type: PieceType("Rook".into()),
                    owner: player2.clone(),
                });
            }

            if i == 1 || i == 6 {
                board[7][i] = Some(Piece {
                    piece_type: PieceType("Knight".into()),
                    owner: player2.clone(),
                });
            }

            if i == 4 {
                board[7][i] = Some(Piece {
                    piece_type: PieceType("King".into()),
                    owner: player2.clone(),
                });
            }
        });

        Self {
            board,
            turn: player1.clone(),
            players: (player1, player2),
            rules,
            disagreement_count: 0,
            max_disagreements: 3,
        }
    }

    pub fn apply_move(
        &mut self,
        player_id: &PlayerId,
        from: (u8, u8),
        to: (u8, u8),
    ) -> Result<(), GameError> {
        let piece = self.board[from.1 as usize][from.0 as usize]
            .as_ref()
            .unwrap();

        let rule = self
            .rules
            .get(&piece.piece_type.0)
            .ok_or(GameError::ViolatesRule(format!(
                "Unknown piece: {}",
                piece.piece_type.0
            )))?;

        let dx = to.0 as i8 - from.0 as i8;
        let dy = to.1 as i8 - from.1 as i8;

        let fy = if piece.owner == self.players.0 { 1 } else { -1 };

        let mut valid = false;
        for cap in &rule.capabilities {
            match cap {
                rules::MovementCap::Slide {
                    pattern,
                    range,
                    can_jump,
                    only_forward,
                } => {
                    if *only_forward {
                        // realised -y for 2nd player and +y for first player
                        if dy.signum() != 0 && dy.signum() != fy {
                            continue;
                        }
                        if dy != 0 && dy.signum() != fy {
                            continue;
                        }
                    }

                    let dist = dx.abs().max(dy.abs()) as u8;
                    if *range > 0 && dist > *range {
                        continue;
                    }

                    let matches = match pattern {
                        rules::SlidePattern::FrontBack => dx == 0 || dy == 0,
                        rules::SlidePattern::Diagonal => dx.abs() == dy.abs(),
                        rules::SlidePattern::Omni => dx == 0 || dy == 0 || dx.abs() == dy.abs(),
                    };

                    if !matches {
                        continue;
                    }

                    if !*can_jump {
                        if self.check_path_clear(from, to).is_err() {
                            continue;
                        }
                    }

                    valid = true;
                    break;
                }
                rules::MovementCap::Leap { possibilities } => {
                    if possibilities.contains(&(dx, dy)) {
                        valid = true;
                        break;
                    }
                }
            }
        }

        if !valid {
            return Err(GameError::ViolatesRule(
                "Move not allowed by any rule".into(),
            ));
        }

        // Check if it's the player's turn
        if player_id != &self.turn {
            return Err(GameError::NotYourTurn {
                current_player: self.turn.0.clone(),
            });
        }

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

    /// Check if a player has any royal pieces remaining on the board
    pub fn has_royal_pieces(&self, player: &PlayerId) -> bool {
        for row in &self.board {
            for square in row {
                if let Some(piece) = square {
                    if piece.owner == *player {
                        if let Some(rule) = self.rules.get(&piece.piece_type.0) {
                            if rule.is_royal {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        false
    }

    /// Check if the game is over (a player has lost all their royal pieces)
    pub fn check_game_over(&self) -> Option<PlayerId> {
        let has_royal_rules = self.rules.values().any(|rule| rule.is_royal);

        if !has_royal_rules {
            return None;
        }

        let p1_has_royal = self.has_royal_pieces(&self.players.0);
        let p2_has_royal = self.has_royal_pieces(&self.players.1);

        if !p1_has_royal && p2_has_royal {
            // Player 1 lost all royal pieces, Player 2 wins
            return Some(self.players.1.clone());
        }
        if !p2_has_royal && p1_has_royal {
            // Player 2 lost all royal pieces, Player 1 wins
            return Some(self.players.0.clone());
        }
        None
    }

    fn check_path_clear(&self, from: (u8, u8), to: (u8, u8)) -> Result<(), GameError> {
        let dx = to.0 as i8 - from.0 as i8;
        let dy = to.1 as i8 - from.1 as i8;

        let step_x = dx.signum();
        let step_y = dy.signum();

        // if its not straigjt line or diag its a jump (knight)
        if dx.abs() != dy.abs() && dx != 0 && dy != 0 {
            return Ok(());
        }

        let mut curr_x = from.0 as i8 + step_x;
        let mut curr_y = from.1 as i8 + step_y;

        while (curr_x, curr_y) != (to.0 as i8, to.1 as i8) {
            if self.board[curr_y as usize][curr_x as usize].is_some() {
                return Err(GameError::ViolatesRule("Path is blocked".into()));
            }
            curr_x += step_x;
            curr_y += step_y;
        }

        Ok(())
    }
}
