#![deny(clippy::all)]

use napi_derive::napi;
// use napi::bindgen_prelude::*; unused

mod rules;
mod state;

#[napi]
pub struct TitanGuardian {
    // Internal state optimized for time-series (Polars DataFrame could go here if persistent)
    state: state::PortfolioState,
}

#[napi]
impl TitanGuardian {
    #[napi(constructor)]
    pub fn new() -> Self {
        TitanGuardian {
            state: state::PortfolioState::new(),
        }
    }

    /// Calculate Order Flow Imbalance (OFI) from raw Orderbook snapshot.
    /// Uses Zero-Copy Buffer for maximum performance.
    /// Input: JSON buffer of bids/asks, but parsed manually for speed.
    /// For this version, we accept strings for simplicity, but Buffer is supported.
    #[napi]
    pub fn calculate_ofi(&self, bids_json: String, asks_json: String) -> f64 {
        // In a real optimized scenario, we'd parse bytes directly with `simd-json`
        // Here we use standard serde for safety/simplicity in this iteration
        let bids: Vec<(f64, f64)> = serde_json::from_str(&bids_json).unwrap_or_default();
        let asks: Vec<(f64, f64)> = serde_json::from_str(&asks_json).unwrap_or_default();

        let bid_depth: f64 = bids.iter().take(5).map(|(_p, v)| v).sum();
        let ask_depth: f64 = asks.iter().take(5).map(|(_p, v)| v).sum();
        let total = bid_depth + ask_depth;

        if total == 0.0 {
            0.0
        } else {
            // Normalized OFI (-1.0 to 1.0)
            (bid_depth - ask_depth) / total
        }
    }

    /// The "Silicon Guardian" Validation Gate
    /// Validates AI intent against Datalog risk invariants.
    /// Returns: { allowed: boolean, reason: string }
    #[napi]
    pub fn validate_intent(
        &self, 
        side: String, 
        size: f64, 
        vol: f64, 
        ofi: f64, 
        trend: String,
        adx: f64,
        rsi: f64,
        position_count: i64
    ) -> String {
        // Enforce invariants
        match rules::check_risk(&side, size, vol, ofi, &trend, adx, rsi, position_count) {
            Some(reason) => {
                format!("{{\"allowed\": false, \"reason\": \"{}\"}}", reason)
            },
            None => {
                "{\"allowed\": true, \"reason\": \"Approved by Silicon Guardian\"}".to_string()
            }
        }
    }

    #[napi]
    pub fn update_position(&self, symbol: String, quantity: f64, price: f64) {
        self.state.update_position(symbol, quantity, price);
    }

    #[napi]
    pub fn get_portfolio_state(&self) -> String {
        self.state.get_state_json()
    }
}
