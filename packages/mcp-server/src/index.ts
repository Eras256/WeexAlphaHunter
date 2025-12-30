#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { localAI, createConsensusEngine, GeminiClient, logger } from "@wah/core";
import * as dotenv from 'dotenv';

dotenv.config();

// Initialize The Council (Consensus Engine)
const geminiClient = new GeminiClient();
const consensusEngine = createConsensusEngine(geminiClient);

const server = new Server(
    {
        name: "w-alpha-hunter-mcp",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

/**
 * Tool Definitions
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "get_market_consensus",
                description: "Analyze a crypto market pair using the 'Council of 6' (Gemini, Llama3, DeepSeek, Mixtral, Titan Neural, Math). Returns a unified consensus signal.",
                inputSchema: {
                    type: "object",
                    properties: {
                        pair: {
                            type: "string",
                            description: "The trading pair to analyze (e.g. BTC/USDT)",
                        },
                        currentPrice: {
                            type: "number",
                            description: "The current market price of the asset",
                        },
                        context: {
                            type: "string",
                            description: "Optional extra context (e.g. 'Breaking news about ETF')",
                        }
                    },
                    required: ["pair", "currentPrice"],
                },
            },
        ],
    };
});

/**
 * Tool Execution
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "get_market_consensus") {
        // Validate arguments safely
        const args = request.params.arguments as any;
        const price = args.currentPrice;
        const pair = args.pair;

        if (!price || !pair) {
            throw new Error("Missing arguments: pair and currentPrice are required.");
        }

        try {
            console.error(`[MCP] Requesting Consensus for ${pair}...`); // Log to stderr so it doesn't break stdin/stdout transport

            // Construct Market Data Object
            // In a real deployed version, the engine might fetch live indicators itself.
            // For this MCP tool, we generate a snapshot of indicators to feed the council.
            const marketData = {
                symbol: pair,
                price: price,
                indicators: {
                    RSI: 30 + Math.random() * 40, // Mock live data feed
                    Trend: Math.random() > 0.5 ? 1 : -1,
                    OrderImbalance: (Math.random() * 0.6) - 0.3,
                    FearGreed: 50
                }
            };

            // EXECUTE THE COUNCIL OF 6
            const consensus = await consensusEngine.generateConsensusSignal(marketData);

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            pair,
                            price,
                            consensus_action: consensus.action,
                            consensus_score: consensus.consensusScore,
                            confidence: consensus.confidence,
                            reasoning: consensus.reasoning,
                            models_consulted: consensus.modelUsed, // "Gemini, Llama, Titan..."
                            council_details: consensus.details
                        }, null, 2),
                    },
                ],
            };
        } catch (error: any) {
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            error: "Consensus Failed",
                            message: error.message,
                            fallback: "HOLD"
                        })
                    }
                ],
                isError: true
            }
        }
    }

    throw new Error(`Tool not found: ${request.params.name}`);
});

// Start the server using Stdio transport
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("🦁 WAlphaHunter Consensus MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
