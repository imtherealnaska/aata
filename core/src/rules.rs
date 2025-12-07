use serde::{Deserialize, Serialize};

/// designing JSON format
/// a piece can move in 2 ways ,
/// Slide it , jump it
/// slide is more like a pawn move , jump is more knight move
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum MovementCap {
    #[serde(rename = "slide")]
    Slide {
        pattern: SlidePattern,
        range: u8,
        can_jump: bool,
        only_forward: bool,
    },
    #[serde(rename = "leap")]
    Leap { possibilities: Vec<(i8, i8)> },
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum SlidePattern {
    #[serde(rename = "linear")]
    FrontBack,
    #[serde(rename = "diagonal")]
    Diagonal,
    #[serde(rename = "omni")]
    Omni,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct PieceRule {
    pub name: String,
    pub symbol: String,
    pub capabilities: Vec<MovementCap>,
}
