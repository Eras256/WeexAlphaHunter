
import { spawn } from 'child_process';
import path from 'path';

console.log("🦁 TESTING MCP SERVER: THE COUNCIL OF 6");
console.log("=======================================");

// Path to the MCP server executable (we run it via tsx for dev speed)
const serverScript = path.join(process.cwd(), 'packages/mcp-server/src/index.ts');
const serverProcess = spawn('npx', ['tsx', serverScript], {
    stdio: ['pipe', 'pipe', 'inherit'],
    shell: true
});

let buffer = '';

serverProcess.stdout.on('data', (data) => {
    const chunk = data.toString();
    buffer += chunk;

    // Process messages delimited by newlines (JSON-RPC)
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // Keep incomplete line in buffer

    for (const line of lines) {
        if (!line.trim()) continue;
        try {
            const message = JSON.parse(line);
            handleMessage(message);
        } catch (e) {
            console.error("Failed to parse JSON-RPC:", line);
        }
    }
});

function send(msg: any) {
    const str = JSON.stringify(msg) + '\n';
    try {
        serverProcess.stdin.write(str);
    } catch (e) {
        console.error("Failed to write to stdin", e);
    }
}

// 1. Initialize
console.log(">> Sending Initialize...");
send({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "TestClient", version: "1.0" }
    }
});

let initialized = false;

function handleMessage(msg: any) {
    // console.log("<< Received:", JSON.stringify(msg, null, 2));

    if (msg.id === 1 && msg.result) {
        console.log("✅ Initialized. Protocol Version:", msg.result.protocolVersion);
        initialized = true;

        // 2. List Tools
        console.log(">> Listing Tools...");
        send({
            jsonrpc: "2.0",
            id: 2,
            method: "tools/list"
        });
    }

    if (msg.id === 2 && msg.result) {
        console.log("✅ Tools Found:", msg.result.tools.map((t: any) => t.name).join(', '));

        // 3. Call Tool: get_market_consensus
        console.log("\n>> Calling Tool: get_market_consensus (BTC/USDT)...");
        console.log("   (This triggers the Council to debate...)");

        send({
            jsonrpc: "2.0",
            id: 3,
            method: "tools/call",
            params: {
                name: "get_market_consensus",
                arguments: {
                    pair: "BTC/USDT",
                    currentPrice: 68500
                }
            }
        });
    }

    if (msg.id === 3) {
        console.log("\n🦁 COUNCIL VERDICT RECEIVED:");
        if (msg.error) {
            console.error("❌ Error:", msg.error);
        } else {
            const content = JSON.parse(msg.result.content[0].text);
            console.log(JSON.stringify(content, null, 2));
        }
        process.exit(0);
    }
}

// Timeout
setTimeout(() => {
    console.error("Timeout waiting for response.");
    process.exit(1);
}, 15000);
