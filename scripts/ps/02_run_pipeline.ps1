<#
.SYNOPSIS
    WAlphaHunter Pipeline Runner
    Orchestrates the entire "Data -> AI -> Backtest -> Proof" lifecycle.
.DESCRIPTION
    This script runs the full end-to-end pipeline:
    1. Feature Engineering (Python)
    2. AI Decision Generation (TS + Gemini)
    3. Backtesting (TS)
    4. Compliance Checks (WEEX API Mock/Live)
    5. Dashboard Update
.EXAMPLE
    .\02_run_pipeline.ps1 -RunId "RUN_001" -Mock $true
#>

param (
    [string]$RunId = (Get-Date -Format "yyyyMMdd-HHmm"),
    [switch]$Mock = $false
)

$ErrorActionPreference = "Stop"

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "   WAlphaHunter PIPELINE :: RunID: $RunId                         " -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan

# 0. Load Environment
if (Test-Path ".env") {
    Get-Content .env | ForEach-Object {
        if ($_ -match "^([^#=]+)=(.*)") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
}

# 1. Feature Engineering (Python)
Write-Host "`n[STEP 1] Generating Features (Python/Polars)..." -ForegroundColor Yellow
$pyCmd = ".\python\venv\Scripts\python.exe"
if (-not (Test-Path $pyCmd)) { $pyCmd = "python" } # Fallback

# Note: We assume requirements are installed. If not, user runs bootstrap.
& $pyCmd python/src/feature_engineering.py --run-id $RunId
if ($LASTEXITCODE -ne 0) { throw "Feature engineering failed." }

# 2. AI Decision Stream (Simulated if no key, or Real Gemini)
Write-Host "`n[STEP 2] Generating AI Signals & Audit Logs..." -ForegroundColor Yellow
# Using pnpm to run TS engine
pnpm run ai:generate --runId $RunId --mock $Mock
if ($LASTEXITCODE -ne 0) { throw "AI generation failed." }

# 3. Backtest Execution
Write-Host "`n[STEP 3] Running Event-Driven Backtest..." -ForegroundColor Yellow
# Passes the features + AI logs to the backtester
pnpm run backtest:run --runId $RunId --capital 10000
if ($LASTEXITCODE -ne 0) { throw "Backtest failed." }

# 4. WEEX API Compliance Task (The "10 USD" test)
Write-Host "`n[STEP 4] WEEX API Compliance/Mock Test..." -ForegroundColor Yellow
# Used for the Demo Video proof
pnpm run compliance:test-api --runId $RunId --mock $Mock
if ($LASTEXITCODE -ne 0) { throw "Compliance test failed." }

# 5. Summary
Write-Host "`n[SUCCESS] Pipeline Complete." -ForegroundColor Green
Write-Host "Artifacts stored in: artifacts/reports/$RunId" -ForegroundColor User
