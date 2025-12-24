<#
.SYNOPSIS
    WAlphaHunter Bootstrap Script for Windows 11
    Sets up directories, checks dependencies, and prepares the environment.
.DESCRIPTION
    This script initializes the project structure required for the WEEX Alpha Awakens Hackathon.
    It creates data/artifact directories, enforces strict execution policies for child scripts,
    and validates that Node.js, pnpm, and Python are correctly installed.
.NOTES
    Author: WAlphaHunter Architect
    Version: 2.0.0 (Hackathon Edition)
#>

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "   WAphaHunter (WEEX Alpha Awakens) - Environment Bootstrap       " -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan

# 1. Enforce TLS 1.2+ for any web requests (just in case)
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# 2. Dependency Check Function
function Test-Command ($command, $name) {
    if (Get-Command $command -ErrorAction SilentlyContinue) {
        Write-Host "[OK] $name found: $(Get-Command $command | Select-Object -ExpandProperty Source)" -ForegroundColor Green
        return $true
    }
    else {
        Write-Host "[ERROR] $name NOT found. Please install it and add to PATH." -ForegroundColor Red
        return $false
    }
}

$allDeps = $true
$allDeps = (Test-Command "node" "Node.js (v20+ recommended)") -and $allDeps
$allDeps = (Test-Command "pnpm" "pnpm (Package Manager)") -and $allDeps
$allDeps = (Test-Command "python" "Python (3.10+)") -and $allDeps

if (-not $allDeps) {
    Write-Host "`nCRITICAL: Missing dependencies. Aborting." -ForegroundColor Red
    exit 1
}

# 3. Create Project Directory Structure
Write-Host "`n[+] Creating Directory Structure..." -ForegroundColor Yellow

$directories = @(
    "data\raw",
    "data\processed",
    "data\logs",
    "data\backtest",
    "data\compliance\weex_proofs",
    "artifacts\reports",
    "artifacts\compliance",
    "artifacts\proof-kit\docs",
    "artifacts\security",
    "python\venv"
)

foreach ($dir in $directories) {
    $fullPath = Join-Path $PSScriptRoot "..\..\" $dir
    if (-not (Test-Path $fullPath)) {
        New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
        Write-Host "    Created: $dir" -ForegroundColor Gray
    }
    else {
        Write-Host "    Exists:  $dir" -ForegroundColor DarkGray
    }
}

# 4. Create .env.example if not exists (NEVER create .env)
$envExamplePath = Join-Path $PSScriptRoot "..\..\.env.example"
if (-not (Test-Path $envExamplePath)) {
    $envContent = @"
# WEEX API CONFIG (Leave empty if in Mock Mode)
WEEX_API_KEY=
WEEX_SECRET_KEY=
WEEX_PASSPHRASE=

# GEMINI AI CONFIG (For Logic/Audit)
GEMINI_API_KEY=

# PROJECT SETTINGS
# 'mock' = No API calls (Safe for Demo/Submission)
# 'live' = Real trading (Requires WEEX Approval)
EXECUTION_MODE=mock
INITIAL_CAPITAL=10000
LOG_LEVEL=info
"@
    Set-Content -Path $envExamplePath -Value $envContent
    Write-Host "[+] Created template: .env.example" -ForegroundColor Green
}

# 5. Git Ignore Check (Sanity)
$gitIgnorePath = Join-Path $PSScriptRoot "..\..\.gitignore"
if (-not (Test-Path $gitIgnorePath)) {
    Write-Host "[WARN] .gitignore missing! Creating basic one..." -ForegroundColor Yellow
    $gitIgnoreContent = @"
node_modules/
dist/
.env
data/
artifacts/
.venv/
__pycache__/
*.log
.DS_Store
"@
    Set-Content -Path $gitIgnorePath -Value $gitIgnoreContent
}

# 6. Python Venv Setup Hint
Write-Host "`n[INFO] Python Setup Hint:" -ForegroundColor Cyan
Write-Host "    If you haven't created the venv yet, run:"
Write-Host "    python -m venv .venv"
Write-Host "    .\.venv\Scripts\Activate.ps1"
Write-Host "    pip install -r python/requirements.txt"

Write-Host "`n[SUCCESS] WAlphaHunter Environment Ready." -ForegroundColor Green
Write-Host "Run 'pnpm install' next." -ForegroundColor Green
