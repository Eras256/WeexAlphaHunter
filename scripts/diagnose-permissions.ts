
import { createHmac } from 'crypto';
import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno
const rootEnvPath = path.resolve(process.cwd(), '.env');
const localEnvPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: rootEnvPath });
dotenv.config({ path: localEnvPath, override: true });

const API_KEY = process.env.WEEX_API_KEY || '';
const API_SECRET = process.env.WEEX_SECRET_KEY || '';
const PASSPHRASE = process.env.WEEX_PASSPHRASE || '';

console.log("🔍 DIAGNÓSTICO DE PERMISOS Y SALDOS WEEX");
console.log("=========================================");
console.log(`🔑 API Key finaliza en: ...${API_KEY.slice(-4)}`);

if (!API_KEY || !API_SECRET) {
    console.error("❌ ERROR: Faltan las credenciales en .env o .env.local");
    process.exit(1);
}

// Función de firma (Reutilizando lógica de WeexClient)
function signRequest(timestamp: string, method: string, path: string, body?: any) {
    const bodyStr = body ? JSON.stringify(body) : '';
    const payload = `${timestamp}${method.toUpperCase()}${path}${bodyStr}`;
    return createHmac('sha256', API_SECRET).update(payload).digest('base64');
}

async function sendRequest(label: string, baseUrl: string, method: 'GET' | 'POST', endpoint: string, body?: any) {
    const timestamp = Date.now().toString();
    const signature = signRequest(timestamp, method, endpoint, body);

    console.log(`\n📡 Probando ${label}...`);
    console.log(`   URL: ${baseUrl}${endpoint}`);

    try {
        const response = await axios({
            method,
            url: `${baseUrl}${endpoint}`,
            headers: {
                'Content-Type': 'application/json',
                'ACCESS-KEY': API_KEY,
                'ACCESS-SIGN': signature,
                'ACCESS-TIMESTAMP': timestamp,
                'ACCESS-PASSPHRASE': PASSPHRASE,
                'locale': 'en-US',
                'User-Agent': 'Mozilla/5.0'
            },
            data: body,
            timeout: 5000
        });

        console.log(`   ✅ ÉXITO (${response.status})`);
        console.log(`   📦 Datos:`, JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error: any) {
        console.log(`   ❌ FALLÓ (${error.response?.status || 'Error Red'})`);
        if (error.response?.data) {
            console.log(`   ⚠️ Respuesta Servidor:`, JSON.stringify(error.response.data, null, 2));
        } else {
            console.log(`   ⚠️ Error:`, error.message);
        }
        return null;
    }
}

async function main() {
    // 1. Probar Saldo FUTUROS (Donde falla el bot)
    await sendRequest(
        "FUTUROS (Contract Assets)",
        "https://api-contract.weex.com",
        "GET",
        "/capi/v2/account/assets"
    );

    // 2. Probar Saldo SPOT (Posible ubicación de fondos)
    // Intentamos alcanzar Spot a través del gateway de contratos o api.weex.com si resuelve
    await sendRequest(
        "SPOT (Vía api.weex.com)",
        "https://api.weex.com",
        "GET",
        "/api/spot/v1/account/assets"
    );

    // Intento alternativo por si es un tema de DNS y el gateway lo acepta
    await sendRequest(
        "SPOT (Vía api-contract gateway)",
        "https://api-contract.weex.com",
        "GET",
        "/api/spot/v1/account/assets"
    );

    // 3. Probar Configuración de Cuenta (A veces revela permisos)
    await sendRequest(
        "INFO CUENTA (Spot Account)",
        "https://api.weex.com",
        "GET",
        "/api/spot/v1/account/info"
    );
}

main();
