
import { WeexClient } from '../packages/engine-compliance/src/weex-client.js';
import { logger, sleep } from '../packages/core/src/index.js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno
const rootEnvPath = path.resolve(process.cwd(), '.env');
const localEnvPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: rootEnvPath });
dotenv.config({ path: localEnvPath, override: true });

// Símbolo de prueba de "poling" (usamos BTC por liquidez, orden mínima)
const WATCH_SYMBOL = 'cmt_btcusdt';

async function startWatchman() {
    console.log(`
╔════════════════════════════════════════════════════════════════════╗
║ 🕵️ ALPHA HUNTER WATCHMAN - MODULATING SURVEILLANCE                ║
╠════════════════════════════════════════════════════════════════════╣
║ Objetivo: Detectar ACTIVACIÓN de Trading en WEEX (Ronda Prelim.)   ║
║ Método:   Sondeo pasivo de API + Intento de orden inocua           ║
║ Intervalo: Cada 30 minutos (ajustable)                             ║
╚════════════════════════════════════════════════════════════════════╝
    `);

    const client = new WeexClient();
    client.mode = 'live'; // Forzamos LIVE para probar conexión real

    let pollingActive = true;
    let consecutiveErrors = 0;

    while (pollingActive) {
        const timestamp = new Date().toISOString();
        console.log(`\n[${timestamp}] 📡 Sondeando estado del servidor WEEX...`);

        try {
            // 1. Verificación Pasiva: Saldo (Contract Assets)
            // Si esto falla con 40753, sabemos que sigue bloqueado sin necesidad de ordenar.
            try {
                await client.getAccountInfo();
                console.log("   ✅ Lectura de Saldo: ÉXITO (El servidor responde, ¿trading activo?)");
            } catch (e: any) {
                if (e.message.includes('40753') || (e.response && e.response.data && e.response.data.code === '40753')) {
                    console.log("   ⛔ Estado: BLOQUEADO (40753 - Contract Biz Disabled). Sigue dormido.");
                    // Si falla el saldo por bloqueo de biz, NO intentamos ordenar (ahorramos API calls).
                    await waitCycle();
                    continue;
                } else {
                    console.log(`   ⚠️ Otro Error de Lectura: ${e.message}`);
                }
            }

            // 2. Verificación Activa: Orden Mínima (Solo si pasamos el saldo)
            // Si el saldo se lee bien, intentamos una orden dummy muy lejos del precio para probar ejecución.
            console.log("   ⚡ Intentando Orden Centinela (Muy lejos del precio)...");

            const ticker = await client.getTicker(WATCH_SYMBOL);
            const safePrice = ticker * 0.5; // 50% abajo del precio, imposible que se llene

            try {
                const order = await client.placeOrder(
                    WATCH_SYMBOL,
                    'BUY',
                    0.001, // Mínimo
                    Number(safePrice.toFixed(1))
                );

                if (order && order.orderId) {
                    // ¡ÉXITO! ¡LA CARRERA HA COMENZADO!
                    console.log("\n🚨🚨🚨 ALERTA ROJA: ¡EL MERCADO SE HA ABIERTO! 🚨🚨🚨");
                    console.log("   ✅ Orden Aceptada ID: " + order.orderId);
                    console.log("   🚀 INICIANDO PROTOCOLO TITAN AHORA MISMO...");

                    // Cancelamos la orden centinela inmediatamente
                    await client.cancelOrder(WATCH_SYMBOL, order.orderId);

                    // Aquí podríamos disparar el bot principal, o simplemente salir y avisar
                    // Por seguridad, salimos para que el usuario corra el script principal manual
                    process.exit(0);
                }
            } catch (orderError: any) {
                const msg = orderError.response?.data?.msg || orderError.message;
                const code = orderError.response?.data?.code;

                if (code === '40753' || msg.includes('disabled')) {
                    console.log("   ⛔ Intentar Orden: BLOQUEADO (40753). Falta poco...");
                } else {
                    console.log(`   ⚠️ Error de Orden Inesperado: ${msg} (${code})`);
                }
            }

        } catch (error: any) {
            console.error(`   ❌ Error General Watchman: ${error.message}`);
        }

        await waitCycle();
    }
}

async function waitCycle() {
    const MINUTES = 30; // Intervalo de 30 mins para no saturar 
    console.log(`   💤 Durmiendo ${MINUTES} minutos...`);
    await sleep(MINUTES * 60 * 1000);
}

startWatchman();
