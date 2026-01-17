
import * as fs from 'fs';
import * as readline from 'readline';

const INPUT_FILE = './ai_logs_backup.jsonl';
const OUTPUT_FILE = './packages/neural/training_data.json';

interface LogEntry {
    input: {
        symbol: string;
        price: number;
        technical_indicators: {
            RSI: number;
            Trend: "BULLISH" | "BEARISH";
        };
    };
    output: {
        action: string;
        confidence: number;
        reasoning: string;
        modelUsed: string;
    };
}

async function processLogs() {
    const fileStream = fs.createReadStream(INPUT_FILE);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    const trainingExamples: any[] = [];
    let highConfidenceCount = 0;

    console.log("🔍 Scanning logs for High Confidence decisions (> 0.8)...");

    for await (const line of rl) {
        try {
            const entry: LogEntry = JSON.parse(line);

            // Filter for High Confidence Consensus decisions
            if (entry.output.confidence >= 0.8 && !entry.output.modelUsed.includes("Fallback")) {

                // Create a training example
                const example = {
                    prompt: `Market Analysis: Symbol=${entry.input.symbol}, Price=${entry.input.price}, RSI=${entry.input.technical_indicators.RSI}, Trend=${entry.input.technical_indicators.Trend}. Action?`,
                    completion: `Action: ${entry.output.action}. Reasoning: ${entry.output.reasoning}`
                };

                trainingExamples.push(example);
                highConfidenceCount++;
            }
        } catch (e) {
            // Ignore parse errors
        }
    }

    console.log(`✅ Found ${highConfidenceCount} high-quality training examples.`);

    // Save to file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(trainingExamples, null, 2));
    console.log(`💾 Saved dataset to ${OUTPUT_FILE}`);
}

processLogs();
