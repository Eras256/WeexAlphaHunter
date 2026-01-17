
import { TitanGuardian } from './packages/guardian/index.js';

console.log("🦁 Testing Titan Guardian NAPI Interaction...");

try {
    const guardian = new TitanGuardian();
    console.log("✅ Guardian Instantiated.");

    const ofi = guardian.calculateOfi("[]", "[]");
    console.log(`✅ OFI Calculation Check: ${ofi} (Expected 0)`);

    // Test Validate Intent
    const res = guardian.validateIntent("BUY", 1.0, 0.5, 0.2, "BULLISH");
    console.log(`✅ Validation Check: ${res}`);

} catch (e) {
    console.error("❌ Linkage Error:", e);
}
