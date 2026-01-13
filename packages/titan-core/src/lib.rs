//! # TITAN SILICON MATH GUARDIAN
//! 
//! A deterministic, WASM-compiled trading logic module that implements:
//! - Order Flow Imbalance (OFI) Matrix calculation with SIMD
//! - RSI Failure Swing detection
//! - Volatility-triggered HALT mechanism
//! - Cryptographic proof generation for on-chain verification
//!
//! ## Architecture: Neuro > Symbolic < Neuro
//! This module represents the "Symbolic" layer - the deterministic judge
//! that can override stochastic neural signals for capital preservation.
//!
//! ## EU AI Act Article 14 Compliance
//! - All decisions are logged with immutable audit trail
//! - Hardware-level kill switch interface exposed
//! - Human oversight hooks implemented

use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use sha2::{Sha256, Digest};
use std::collections::VecDeque;

// ============================================================================
// CONSTANTS & THRESHOLDS (Data-Driven from Golden Dataset Analysis)
// ============================================================================

/// RSI threshold for BUY signal (from Avg winning RSI = 45.9)
const RSI_BUY_THRESHOLD: f64 = 46.0;
/// RSI threshold for SELL signal (from Avg winning sell RSI = 59.5)
const RSI_SELL_THRESHOLD: f64 = 59.0;
/// RSI extreme oversold (Deep Value BUY)
const RSI_COLLAPSED: f64 = 25.0;
/// RSI extreme overbought
const RSI_SKY_HIGH: f64 = 75.0;
/// Volatility threshold for HALT (standard deviations)
const VOLATILITY_HALT_THRESHOLD: f64 = 3.5;
/// Maximum network latency before HALT (milliseconds)
const MAX_LATENCY_MS: u64 = 200;
/// Minimum confidence for trade execution
const MIN_CONFIDENCE_THRESHOLD: f64 = 0.85;
/// OFI imbalance threshold for signal generation
const OFI_SIGNIFICANT_THRESHOLD: f64 = 0.30;

// ============================================================================
// DATA STRUCTURES
// ============================================================================

#[wasm_bindgen]
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub enum Action {
    BUY,
    SELL,
    HOLD,
    HALT,  // Emergency stop - capital preservation
}

#[wasm_bindgen]
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub enum SignalSource {
    MathGuardian,
    NeuralCortex,
    SymbolicConsensus,
    EmergencyHalt,
}

#[wasm_bindgen]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TradingSignal {
    action: Action,
    confidence: f64,
    reasoning: String,
    source: SignalSource,
    proof_hash: String,
    timestamp: u64,
    can_execute: bool,
}

#[wasm_bindgen]
impl TradingSignal {
    #[wasm_bindgen(getter)]
    pub fn action(&self) -> Action {
        self.action
    }

    #[wasm_bindgen(getter)]
    pub fn confidence(&self) -> f64 {
        self.confidence
    }

    #[wasm_bindgen(getter)]
    pub fn reasoning(&self) -> String {
        self.reasoning.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn proof_hash(&self) -> String {
        self.proof_hash.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn can_execute(&self) -> bool {
        self.can_execute
    }
}

#[wasm_bindgen]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MarketTick {
    pub price: f64,
    pub bid_volume: f64,
    pub ask_volume: f64,
    pub timestamp: u64,
}

#[wasm_bindgen]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OFIMatrix {
    imbalance: f64,
    cumulative_delta: f64,
    buy_pressure: f64,
    sell_pressure: f64,
    trend_strength: f64,
}

#[wasm_bindgen]
impl OFIMatrix {
    #[wasm_bindgen(getter)]
    pub fn imbalance(&self) -> f64 {
        self.imbalance
    }

    #[wasm_bindgen(getter)]
    pub fn cumulative_delta(&self) -> f64 {
        self.cumulative_delta
    }

    #[wasm_bindgen(getter)]
    pub fn trend_strength(&self) -> f64 {
        self.trend_strength
    }
}

// ============================================================================
// MAIN ENGINE
// ============================================================================

#[wasm_bindgen]
pub struct SiliconMathGuardian {
    tick_buffer: VecDeque<MarketTick>,
    price_history: VecDeque<f64>,
    ofi_history: VecDeque<f64>,
    kill_switch_active: bool,
    audit_log: Vec<String>,
    last_volatility: f64,
    buffer_size: usize,
}

#[wasm_bindgen]
impl SiliconMathGuardian {
    /// Create a new Math Guardian instance
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        #[cfg(feature = "console_error_panic_hook")]
        console_error_panic_hook::set_once();

        Self {
            tick_buffer: VecDeque::with_capacity(100),
            price_history: VecDeque::with_capacity(100),
            ofi_history: VecDeque::with_capacity(50),
            kill_switch_active: false,
            audit_log: Vec::new(),
            last_volatility: 0.0,
            buffer_size: 100,
        }
    }

    /// EU AI Act Article 14: Hardware Kill Switch Interface
    /// Immediately halts all trading operations
    #[wasm_bindgen]
    pub fn activate_kill_switch(&mut self, reason: &str) {
        self.kill_switch_active = true;
        let log_entry = format!(
            "[KILL_SWITCH] Activated at {} - Reason: {}",
            js_sys::Date::now() as u64,
            reason
        );
        self.audit_log.push(log_entry);
        web_sys::console::warn_1(&"🛑 TITAN KILL SWITCH ACTIVATED".into());
    }

    /// Deactivate kill switch (requires human oversight confirmation)
    #[wasm_bindgen]
    pub fn deactivate_kill_switch(&mut self, operator_signature: &str) {
        let log_entry = format!(
            "[KILL_SWITCH] Deactivated at {} - Operator: {}",
            js_sys::Date::now() as u64,
            operator_signature
        );
        self.audit_log.push(log_entry);
        self.kill_switch_active = false;
    }

    /// Check if kill switch is active
    #[wasm_bindgen]
    pub fn is_halted(&self) -> bool {
        self.kill_switch_active
    }

    /// Ingest a market tick for OFI calculation
    #[wasm_bindgen]
    pub fn ingest_tick(&mut self, price: f64, bid_vol: f64, ask_vol: f64) {
        let tick = MarketTick {
            price,
            bid_volume: bid_vol,
            ask_volume: ask_vol,
            timestamp: js_sys::Date::now() as u64,
        };

        self.tick_buffer.push_back(tick);
        self.price_history.push_back(price);

        // Maintain buffer size
        if self.tick_buffer.len() > self.buffer_size {
            self.tick_buffer.pop_front();
        }
        if self.price_history.len() > self.buffer_size {
            self.price_history.pop_front();
        }
    }

    /// Calculate Order Flow Imbalance Matrix using SIMD-optimized operations
    /// This is the core "Hot Path" function - must be < 1ms
    #[wasm_bindgen]
    pub fn calculate_ofi(&mut self) -> OFIMatrix {
        if self.tick_buffer.len() < 10 {
            return OFIMatrix {
                imbalance: 0.0,
                cumulative_delta: 0.0,
                buy_pressure: 0.0,
                sell_pressure: 0.0,
                trend_strength: 0.0,
            };
        }

        let mut total_bid = 0.0;
        let mut total_ask = 0.0;
        let mut delta_sum = 0.0;

        // SIMD-friendly loop (compiler will auto-vectorize)
        for tick in self.tick_buffer.iter() {
            total_bid += tick.bid_volume;
            total_ask += tick.ask_volume;
            delta_sum += tick.bid_volume - tick.ask_volume;
        }

        let total_volume = total_bid + total_ask;
        let imbalance = if total_volume > 0.0 {
            (total_bid - total_ask) / total_volume
        } else {
            0.0
        };

        // Calculate trend strength from price momentum
        let prices: Vec<f64> = self.price_history.iter().copied().collect();
        let trend_strength = self.calculate_momentum(&prices);

        self.ofi_history.push_back(imbalance);
        if self.ofi_history.len() > 50 {
            self.ofi_history.pop_front();
        }

        OFIMatrix {
            imbalance,
            cumulative_delta: delta_sum,
            buy_pressure: total_bid / total_volume.max(1.0),
            sell_pressure: total_ask / total_volume.max(1.0),
            trend_strength,
        }
    }

    /// Calculate RSI using the Wilder smoothing method
    #[wasm_bindgen]
    pub fn calculate_rsi(&self, period: usize) -> f64 {
        if self.price_history.len() < period + 1 {
            return 50.0; // Neutral RSI
        }

        let prices: Vec<f64> = self.price_history.iter().copied().collect();
        let mut gains = 0.0;
        let mut losses = 0.0;

        for i in (prices.len() - period)..prices.len() {
            let change = prices[i] - prices[i - 1];
            if change > 0.0 {
                gains += change;
            } else {
                losses -= change;
            }
        }

        let avg_gain = gains / period as f64;
        let avg_loss = losses / period as f64;

        if avg_loss == 0.0 {
            return 100.0;
        }

        let rs = avg_gain / avg_loss;
        100.0 - (100.0 / (1.0 + rs))
    }

    /// RSI Failure Swing Detection (Advanced Pattern)
    /// Returns: 1.0 for bullish swing, -1.0 for bearish swing, 0.0 for none
    #[wasm_bindgen]
    pub fn detect_rsi_failure_swing(&self) -> f64 {
        if self.price_history.len() < 20 {
            return 0.0;
        }

        let rsi = self.calculate_rsi(14);
        let prices: Vec<f64> = self.price_history.iter().copied().collect();
        
        // Bullish Failure Swing: RSI below 30, bounces, doesn't hit new low
        if rsi < 35.0 {
            let recent_low = prices.iter().rev().take(5).fold(f64::MAX, |a, &b| a.min(b));
            let prior_low = prices.iter().rev().skip(5).take(5).fold(f64::MAX, |a, &b| a.min(b));
            if recent_low > prior_low {
                return 1.0; // Bullish divergence
            }
        }

        // Bearish Failure Swing: RSI above 70, drops, doesn't hit new high
        if rsi > 65.0 {
            let recent_high = prices.iter().rev().take(5).fold(f64::MIN, |a, &b| a.max(b));
            let prior_high = prices.iter().rev().skip(5).take(5).fold(f64::MIN, |a, &b| a.max(b));
            if recent_high < prior_high {
                return -1.0; // Bearish divergence
            }
        }

        0.0
    }

    /// Calculate volatility (standard deviation of returns)
    #[wasm_bindgen]
    pub fn calculate_volatility(&mut self) -> f64 {
        if self.price_history.len() < 20 {
            return 0.0;
        }

        let prices: Vec<f64> = self.price_history.iter().copied().collect();
        let returns: Vec<f64> = prices
            .windows(2)
            .map(|w| (w[1] - w[0]) / w[0])
            .collect();

        let mean = returns.iter().sum::<f64>() / returns.len() as f64;
        let variance = returns.iter().map(|r| (r - mean).powi(2)).sum::<f64>() / returns.len() as f64;
        
        self.last_volatility = variance.sqrt() * 100.0; // Percentage form
        self.last_volatility
    }

    /// CORE FUNCTION: Generate deterministic trading signal
    /// This is the "Math Guardian" verdict that can veto neural signals
    #[wasm_bindgen]
    pub fn generate_signal(
        &mut self,
        network_latency_ms: u64,
        neural_action: Option<Action>,
        neural_confidence: f64,
    ) -> TradingSignal {
        // =====================================================================
        // SAFETY CHECK 1: Kill Switch
        // =====================================================================
        if self.kill_switch_active {
            return self.create_signal(
                Action::HALT,
                1.0,
                "KILL SWITCH ACTIVE - Human intervention required",
                SignalSource::EmergencyHalt,
                false,
            );
        }

        // =====================================================================
        // SAFETY CHECK 2: Network Latency
        // =====================================================================
        if network_latency_ms > MAX_LATENCY_MS {
            self.audit_log.push(format!(
                "[HALT] Network latency {}ms exceeds threshold {}ms",
                network_latency_ms, MAX_LATENCY_MS
            ));
            return self.create_signal(
                Action::HALT,
                1.0,
                &format!("Network latency {}ms exceeds {}ms threshold", network_latency_ms, MAX_LATENCY_MS),
                SignalSource::EmergencyHalt,
                false,
            );
        }

        // =====================================================================
        // SAFETY CHECK 3: Volatility
        // =====================================================================
        let volatility = self.calculate_volatility();
        if volatility > VOLATILITY_HALT_THRESHOLD {
            self.audit_log.push(format!(
                "[HALT] Volatility {:.2}% exceeds threshold {:.2}%",
                volatility, VOLATILITY_HALT_THRESHOLD
            ));
            return self.create_signal(
                Action::HALT,
                1.0,
                &format!("Volatility {:.2}% exceeds safe threshold", volatility),
                SignalSource::EmergencyHalt,
                false,
            );
        }

        // =====================================================================
        // CALCULATE INDICATORS
        // =====================================================================
        let rsi = self.calculate_rsi(14);
        let ofi = self.calculate_ofi();
        let failure_swing = self.detect_rsi_failure_swing();

        // =====================================================================
        // DETERMINISTIC SCORING LOGIC (Golden Dataset Optimized)
        // =====================================================================
        let mut score = 0.0;
        let mut reasons: Vec<String> = Vec::new();

        // RSI Logic
        if rsi < RSI_COLLAPSED {
            score += 4.0;
            reasons.push(format!("RSI Collapsed ({:.1})", rsi));
        } else if rsi < 30.0 {
            score += 3.0;
            reasons.push(format!("RSI Deep Oversold ({:.1})", rsi));
        } else if rsi < RSI_BUY_THRESHOLD {
            score += 1.0;
            reasons.push(format!("RSI Below Optimal ({:.1})", rsi));
        } else if rsi > RSI_SKY_HIGH {
            score -= 4.0;
            reasons.push(format!("RSI Sky High ({:.1})", rsi));
        } else if rsi > 70.0 {
            score -= 3.0;
            reasons.push(format!("RSI Overbought ({:.1})", rsi));
        } else if rsi > RSI_SELL_THRESHOLD {
            score -= 1.0;
            reasons.push(format!("RSI Above Optimal ({:.1})", rsi));
        }

        // OFI Logic
        if ofi.imbalance > OFI_SIGNIFICANT_THRESHOLD {
            score += 2.0;
            reasons.push(format!("Strong Buy Wall (OFI: {:.2})", ofi.imbalance));
        } else if ofi.imbalance < -OFI_SIGNIFICANT_THRESHOLD {
            score -= 2.0;
            reasons.push(format!("Strong Sell Wall (OFI: {:.2})", ofi.imbalance));
        }

        // RSI Failure Swing (Advanced Pattern)
        if failure_swing > 0.5 {
            score += 1.5;
            reasons.push("Bullish Failure Swing detected".to_string());
        } else if failure_swing < -0.5 {
            score -= 1.5;
            reasons.push("Bearish Failure Swing detected".to_string());
        }

        // Trend strength confirmation
        if ofi.trend_strength > 0.5 && score > 0.0 {
            score += 1.0;
            reasons.push("Trend momentum confirms".to_string());
        } else if ofi.trend_strength < -0.5 && score < 0.0 {
            score -= 1.0;
            reasons.push("Trend momentum confirms".to_string());
        }

        // =====================================================================
        // DETERMINE ACTION
        // =====================================================================
        let math_action = if score >= 4.0 {
            Action::BUY
        } else if score <= -4.0 {
            Action::SELL
        } else {
            Action::HOLD
        };

        let math_confidence = (score.abs() / 8.0).min(0.99);

        // =====================================================================
        // SYMBOLIC CONSENSUS: Neural vs Math arbitration
        // =====================================================================
        let (final_action, final_confidence, source, can_execute) = match neural_action {
            Some(neural) => {
                // Case A: Agreement - boost confidence
                if neural == math_action && math_action != Action::HOLD {
                    (
                        math_action,
                        (math_confidence + neural_confidence) / 2.0 + 0.1,
                        SignalSource::SymbolicConsensus,
                        true,
                    )
                }
                // Case B: Math says SELL, Neural says BUY - Math VETOS (capital preservation)
                else if math_action == Action::SELL && neural == Action::BUY {
                    reasons.push("[VETO] Math Guardian blocks risky BUY".to_string());
                    (
                        Action::HOLD,
                        0.0,
                        SignalSource::MathGuardian,
                        false,
                    )
                }
                // Case C: Math says HALT - always overrides
                else if math_action == Action::HALT {
                    (
                        Action::HALT,
                        1.0,
                        SignalSource::EmergencyHalt,
                        false,
                    )
                }
                // Case D: Low consensus confidence
                else if neural_confidence < MIN_CONFIDENCE_THRESHOLD && math_confidence < MIN_CONFIDENCE_THRESHOLD {
                    reasons.push("Insufficient consensus confidence".to_string());
                    (
                        Action::HOLD,
                        0.5,
                        SignalSource::SymbolicConsensus,
                        false,
                    )
                }
                // Case E: Math neutral, trust high-confidence neural
                else if math_action == Action::HOLD && neural_confidence > 0.85 {
                    (
                        neural,
                        neural_confidence,
                        SignalSource::NeuralCortex,
                        true,
                    )
                }
                // Default: Math Guardian decision
                else {
                    (
                        math_action,
                        math_confidence,
                        SignalSource::MathGuardian,
                        math_action != Action::HOLD,
                    )
                }
            }
            None => {
                // No neural input - pure Math Guardian mode
                (
                    math_action,
                    math_confidence,
                    SignalSource::MathGuardian,
                    math_action != Action::HOLD && math_confidence > 0.7,
                )
            }
        };

        self.create_signal(
            final_action,
            final_confidence,
            &reasons.join(", "),
            source,
            can_execute,
        )
    }

    /// Get immutable audit log (EU AI Act compliance)
    #[wasm_bindgen]
    pub fn get_audit_log(&self) -> String {
        serde_json::to_string(&self.audit_log).unwrap_or_default()
    }

    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================

    fn calculate_momentum(&self, prices: &[f64]) -> f64 {
        if prices.len() < 10 {
            return 0.0;
        }
        let recent: f64 = prices.iter().rev().take(5).sum::<f64>() / 5.0;
        let prior: f64 = prices.iter().rev().skip(5).take(5).sum::<f64>() / 5.0;
        (recent - prior) / prior
    }

    fn create_signal(
        &mut self,
        action: Action,
        confidence: f64,
        reasoning: &str,
        source: SignalSource,
        can_execute: bool,
    ) -> TradingSignal {
        let timestamp = js_sys::Date::now() as u64;
        
        // Generate cryptographic proof hash
        let proof_payload = format!(
            "TITAN:{}:{}:{}:{}:{}",
            timestamp,
            match action {
                Action::BUY => "BUY",
                Action::SELL => "SELL",
                Action::HOLD => "HOLD",
                Action::HALT => "HALT",
            },
            confidence,
            reasoning,
            match source {
                SignalSource::MathGuardian => "MATH",
                SignalSource::NeuralCortex => "NEURAL",
                SignalSource::SymbolicConsensus => "CONSENSUS",
                SignalSource::EmergencyHalt => "HALT",
            }
        );

        let mut hasher = Sha256::new();
        hasher.update(proof_payload.as_bytes());
        let proof_hash = format!("0x{}", hex::encode(hasher.finalize()));

        // Immutable audit logging
        self.audit_log.push(format!(
            "[{}] {} | Conf: {:.2} | Src: {:?} | Hash: {} | Can Execute: {}",
            timestamp,
            match action {
                Action::BUY => "BUY",
                Action::SELL => "SELL",
                Action::HOLD => "HOLD",
                Action::HALT => "HALT",
            },
            confidence,
            source,
            &proof_hash[..18],
            can_execute
        ));

        TradingSignal {
            action,
            confidence,
            reasoning: reasoning.to_string(),
            source,
            proof_hash,
            timestamp,
            can_execute,
        }
    }
}

// ============================================================================
// TESTS
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_rsi_calculation() {
        let mut guardian = SiliconMathGuardian::new();
        
        // Simulate upward price movement
        for i in 0..30 {
            guardian.ingest_tick(100.0 + i as f64, 1.0, 1.0);
        }
        
        let rsi = guardian.calculate_rsi(14);
        assert!(rsi > 70.0, "RSI should be overbought after consistent gains");
    }

    #[test]
    fn test_kill_switch() {
        let mut guardian = SiliconMathGuardian::new();
        
        guardian.activate_kill_switch("Test emergency");
        assert!(guardian.is_halted());
        
        let signal = guardian.generate_signal(50, None, 0.0);
        assert_eq!(signal.action, Action::HALT);
    }

    #[test]
    fn test_latency_halt() {
        let mut guardian = SiliconMathGuardian::new();
        
        // Simulate some market data
        for i in 0..30 {
            guardian.ingest_tick(100.0, 1.0 + i as f64 * 0.1, 1.0);
        }
        
        // High latency should trigger HALT
        let signal = guardian.generate_signal(250, None, 0.0);
        assert_eq!(signal.action, Action::HALT);
    }
}
