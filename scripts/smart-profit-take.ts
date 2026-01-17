/**
 * 💰 Smart Profit Take - Asegura ganancias de las posiciones más rentables
 */

import { WeexClient } from '../packages/engine-compliance/src/weex-client.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SYMBOLS = [
    'cmt_btcusdt',
    'cmt_ethusdt',
    'cmt_solusdt',
    'cmt_xrpusdt',
    'cmt_dogeusdt',
    'cmt_adausdt',
    'cmt_bnbusdt',
    'cmt_ltcusdt'
];

async function smartProfitTake() {
    console.log('\n💰 ═══════════════════════════════════════════════════════════════');
    console.log('   SMART PROFIT TAKE - Asegurando Ganancias');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // WeexClient uses environment variables (WEEX_API_KEY, WEEX_SECRET_KEY, WEEX_PASSPHRASE)
    // and EXECUTION_MODE=live from .env
    const client = new WeexClient();

    try {
        // 1. Get balance first
        console.log('📊 Verificando balance...\n');
        const accountInfo = await client.getAccountInfo();

        // Handle both array and object return types from getAccountInfo
        const accountArray = Array.isArray(accountInfo) ? accountInfo : (accountInfo?.balances || []);
        if (accountArray && accountArray.length > 0) {
            const usdt = accountArray[0] as any;
            console.log(`   💰 Equity: $${parseFloat(usdt.equity || usdt.free || '0').toFixed(2)}`);
            console.log(`   💵 Available: $${parseFloat(usdt.available || usdt.free || '0').toFixed(2)}`);
            console.log(`   📈 Unrealized PnL: $${parseFloat(usdt.unrealizePnl || '0').toFixed(2)}\n`);
        }

        // 2. Check positions for each symbol
        console.log('🔍 Escaneando posiciones...\n');

        interface Position {
            symbol: string;
            side: string;
            size: number;
            unrealizedPnl: number;
            margin: number;
        }

        const allPositions: Position[] = [];

        for (const symbol of SYMBOLS) {
            try {
                const positions = await client.getOpenPositions(symbol);
                if (positions && positions.length > 0) {
                    for (const pos of positions) {
                        const size = parseFloat(pos.available || pos.holdAmount || pos.total || '0');
                        if (size > 0) {
                            allPositions.push({
                                symbol: pos.symbol || symbol,
                                side: pos.holdSide || pos.side || 'unknown',
                                size: size,
                                unrealizedPnl: parseFloat(pos.unrealizedPL || pos.upl || pos.unrealizePnl || '0'),
                                margin: parseFloat(pos.margin || pos.imr || '0')
                            });
                            console.log(`   ✅ Found: ${symbol} (${pos.holdSide}) - PnL: $${parseFloat(pos.unrealizedPL || '0').toFixed(2)}`);
                        }
                    }
                }
            } catch (e) {
                // Ignore
            }
            await new Promise(r => setTimeout(r, 100));
        }

        if (allPositions.length === 0) {
            console.log('   ⚠️ La API no retorna posiciones directamente.');
            console.log('\n🚀 Intentando Flash Close en todos los símbolos...\n');

            let closedAny = false;
            for (const symbol of SYMBOLS) {
                // flashClosePosition only takes symbol, not side
                try {
                    const result = await client.flashClosePosition(symbol);
                    if (result) {
                        console.log(`   ✅ Cerrada: ${symbol}`);
                        closedAny = true;
                    }
                } catch (e: any) {
                    // Only log if it's not a "no position" error
                    if (e.message && !e.message.toLowerCase().includes('position') && !e.message.includes('40010')) {
                        console.log(`   ⚠️ ${symbol}: ${e.message.substring(0, 50)}`);
                    }
                }
                await new Promise(r => setTimeout(r, 200));
            }

            if (!closedAny) {
                console.log('   ℹ️ No se encontraron posiciones para cerrar.\n');
            }
        } else {
            // Sort and close profitable ones
            allPositions.sort((a, b) => b.unrealizedPnl - a.unrealizedPnl);

            console.log('\n🎯 Cerrando posiciones rentables:\n');
            for (const pos of allPositions.filter(p => p.unrealizedPnl > 0).slice(0, 3)) {
                try {
                    await client.flashClosePosition(pos.symbol);
                    console.log(`   ✅ Cerrada: ${pos.symbol} - Ganancia: $${pos.unrealizedPnl.toFixed(2)}`);
                } catch (e: any) {
                    console.log(`   ⚠️ Error: ${e.message}`);
                }
                await new Promise(r => setTimeout(r, 300));
            }
        }

        // 3. Final balance
        console.log('\n📊 Balance final...\n');
        await new Promise(r => setTimeout(r, 1000));
        const finalInfo = await client.getAccountInfo();

        // Handle both array and object return types from getAccountInfo
        const finalArray = Array.isArray(finalInfo) ? finalInfo : (finalInfo?.balances || []);
        if (finalArray && finalArray.length > 0) {
            const usdt = finalArray[0] as any;
            console.log('═══════════════════════════════════════════════════════════════');
            console.log(`   💰 Equity: $${parseFloat(usdt.equity || usdt.free || '0').toFixed(2)}`);
            console.log(`   💵 Available: $${parseFloat(usdt.available || usdt.free || '0').toFixed(2)}`);
            console.log('═══════════════════════════════════════════════════════════════\n');
        }

    } catch (error: any) {
        console.error('❌ Error:', error.message);
    }
}

smartProfitTake();
