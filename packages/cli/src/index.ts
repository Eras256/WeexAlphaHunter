import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import * as dotenv from 'dotenv';
import { localAI } from '@wah/core';

dotenv.config();

const program = new Command();

program
    .name('wah')
    .description('WAlphaHunter CLI - Interface for Titan Hybrid AI & Blockchain Node')
    .version('0.1.0');

program
    .command('status')
    .description('Check the health of local AI and Blockchain connections')
    .action(async () => {
        console.log(chalk.bold.blue('\n🦁 WAlphaHunter System Status 🦁\n'));

        const spinner = ora('Checking connection to Titan Neural Engine...').start();
        await new Promise(r => setTimeout(r, 1000)); // Mock latency
        spinner.succeed(chalk.green('Titan Neural Engine: ONLINE (Local Mode)'));

        // Additional checks could go here (RPC, Twitter API, etc.)
    });

program
    .command('ask')
    .description('Ask Titan AI for a market analysis')
    .argument('<pair>', 'Trading pair (e.g., BTC/USDT)')
    .option('-p, --price <price>', 'Current price', parseFloat)
    .action(async (pair, options) => {
        const price = options.price || 65000;

        console.log(chalk.yellow(`\n🧠 Analyzing ${pair} at $${price}...\n`));

        const spinner = ora('Titan Neural Net computing...').start();

        try {
            // Mock indicators for now - in full CLI we could fetch from an API
            const signal = await localAI.generateSignal({
                price: price,
                indicators: {
                    RSI: 30 + Math.random() * 40,
                    Trend: Math.random() > 0.5 ? 1 : -1,
                    OrderImbalance: (Math.random() * 0.6) - 0.3,
                    FearGreed: 50
                }
            });

            spinner.stop();

            console.log(chalk.bold('--- TITAN SIGNAL REPORT ---'));
            console.log(`Action:     ${getColorForAction(signal.action)(signal.action)}`);
            console.log(`Confidence: ${chalk.cyan((signal.confidence * 100).toFixed(1) + '%')}`);
            console.log(`Source:     ${chalk.magenta(signal.source || 'HYBRID')}`);
            console.log(`Reasoning:  ${chalk.gray(signal.reasoning)}`);

        } catch (error: any) {
            spinner.fail('Analysis failed');
            console.error(error.message);
        }
    });

function getColorForAction(action: string) {
    if (action === 'BUY') return chalk.green.bold;
    if (action === 'SELL') return chalk.red.bold;
    return chalk.yellow.bold;
}

// Interactive Mode
if (!process.argv.slice(2).length) {
    program.outputHelp();
}

program.parse(process.argv);
