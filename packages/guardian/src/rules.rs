use crepe::crepe;

// Datalog Types (Integer scaled x100 or x1000 for precision)
crepe! {
    @input
    struct TradeIntent<'a>(pub &'a str, pub i64); // Side, Size (x1000)

    @input
    struct Volatility(pub i64); // Vol (x1000). 0.85 -> 850

    @input
    struct OfiScore(pub i64); // OFI (x1000). -1000 to 1000

    @input
    struct MarketTrend<'a>(pub &'a str); // "BULLISH", "BEARISH", "SIDEWAYS"

    @input
    struct AdxValue(pub i64); // ADX (x100). 25.0 -> 2500
    
    @input
    struct RsiValue(pub i64); // RSI (x100). 50.0 -> 5000

    @input
    struct PositionCount(pub i64); // Number of open positions for symbol

    @output
    pub struct BlockTrade<'a>(pub &'a str); // Reason

    // ===================================
    // 🛡️ INVARIANTS (The Laws of Physics)
    // ===================================

    // Invariant 1: Block High Volatility
    BlockTrade("High Volatility Halt (Article 14)") <- 
        TradeIntent(_, _), 
        Volatility(v), 
        (v > 850);

    // Invariant 2: OFI Divergence (Buying into Sell Wall)
    BlockTrade("OFI Divergence: Buying into massive Sell Wall") <- 
        TradeIntent("BUY", _), 
        OfiScore(s), 
        (s < -300); // -0.30 in real terms

    // Invariant 3: OFI Divergence (Selling into Buy Wall)
    BlockTrade("OFI Divergence: Selling into massive Buy Wall") <- 
        TradeIntent("SELL", _), 
        OfiScore(s), 
        (s > 300); // +0.30 in real terms
    
    // Invariant 4: Max Position Limit (2 per symbol)
    BlockTrade("Max Positions Reached: Limit is 2 per symbol") <-
        TradeIntent(_, _),
        PositionCount(n),
        (n >= 2);

    // Invariant 5: Counter-Trend in Strong Bullish (ADX > 25)
    // Don't SELL in strong BULLISH unless RSI > 75
    BlockTrade("Regime Filter: SELL blocked in STRONG BULLISH trend") <-
        TradeIntent("SELL", _),
        MarketTrend("BULLISH"),
        AdxValue(adx),
        RsiValue(rsi),
        (adx > 2500),  // ADX > 25
        (rsi < 7500);  // RSI < 75

    // Invariant 6: Counter-Trend in Strong Bearish (ADX > 25)
    // Don't BUY in strong BEARISH unless RSI < 25
    BlockTrade("Regime Filter: BUY blocked in STRONG BEARISH trend") <-
        TradeIntent("BUY", _),
        MarketTrend("BEARISH"),
        AdxValue(adx),
        RsiValue(rsi),
        (adx > 2500),  // ADX > 25
        (rsi > 2500);  // RSI > 25
}

pub fn check_risk(
    side: &str, 
    size: f64, 
    vol: f64, 
    ofi: f64, 
    trend: &str,
    adx: f64,
    rsi: f64,
    position_count: i64
) -> Option<String> {
    let mut runtime = Crepe::new();

    // Scale Inputs to Integers (Fixed Point)
    let size_int = (size * 1000.0) as i64;
    let vol_int = (vol * 1000.0) as i64;
    let ofi_int = (ofi * 1000.0) as i64;
    let adx_int = (adx * 100.0) as i64;
    let rsi_int = (rsi * 100.0) as i64;

    let intent = [TradeIntent(side, size_int)];
    runtime.extend(&intent);

    let vol_fact = [Volatility(vol_int)];
    runtime.extend(&vol_fact);

    let ofi_fact = [OfiScore(ofi_int)];
    runtime.extend(&ofi_fact);

    let trend_fact = [MarketTrend(trend)];
    runtime.extend(&trend_fact);

    let adx_fact = [AdxValue(adx_int)];
    runtime.extend(&adx_fact);

    let rsi_fact = [RsiValue(rsi_int)];
    runtime.extend(&rsi_fact);

    let pos_fact = [PositionCount(position_count)];
    runtime.extend(&pos_fact);

    let (blocks,) = runtime.run();

    if let Some(block) = blocks.into_iter().next() {
        return Some(block.0.to_string());
    }
    None
}
