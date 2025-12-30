/**
 * Test WEEX API Connection - Real Market Data
 */
import axios from 'axios';

async function testWeexAPI() {
    console.log("\n🔍 WEEX API CONNECTION TEST");
    console.log("================================\n");

    const baseUrl = "https://api-contract.weex.com";

    // 1. Test Ticker
    try {
        console.log("📊 Testing Ticker API...");
        const res = await axios.get(`${baseUrl}/capi/v2/market/ticker?symbol=cmt_btcusdt`, { timeout: 10000 });
        if (res.data && res.data.data) {
            console.log(`   ✅ BTC/USDT Price: $${res.data.data.last || res.data.data.price}`);
        } else {
            console.log("   ⚠️ Response format unexpected:", res.data);
        }
    } catch (err: any) {
        console.log(`   ❌ Ticker API Failed: ${err.message}`);
    }

    // 2. Test Order Book Depth
    try {
        console.log("\n📈 Testing Order Book API...");
        const res = await axios.get(`${baseUrl}/capi/v2/market/depth?symbol=cmt_btcusdt&limit=5`, { timeout: 10000 });
        if (res.data && res.data.data) {
            const data = res.data.data;
            console.log(`   ✅ Top Ask: $${data.asks?.[0]?.[0] || 'N/A'}`);
            console.log(`   ✅ Top Bid: $${data.bids?.[0]?.[0] || 'N/A'}`);
        } else {
            console.log("   ⚠️ Response format unexpected");
        }
    } catch (err: any) {
        console.log(`   ❌ Depth API Failed: ${err.message}`);
    }

    // 3. Test Candles
    try {
        console.log("\n📉 Testing Candles API...");
        const res = await axios.get(`${baseUrl}/capi/v2/market/historyCandles?symbol=cmt_btcusdt&granularity=15m&limit=5`, { timeout: 10000 });
        if (res.data && res.data.data) {
            console.log(`   ✅ Got ${res.data.data.length} candles`);
        } else {
            console.log("   ⚠️ Response format unexpected");
        }
    } catch (err: any) {
        console.log(`   ❌ Candles API Failed: ${err.message}`);
    }

    console.log("\n================================");
    console.log("🏁 WEEX API TEST COMPLETE\n");
}

testWeexAPI();
