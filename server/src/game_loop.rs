use tokio::sync::oneshot;
use core::errors::GameError;

pub enum Command {
    MakeMove {
        player_id: String,
        from: (u8, u8),
        to: (u8, u8),
        response: oneshot::Sender<Result<(), GameError>>,
    },
    GetState {
        // what to send ?
    }
}
