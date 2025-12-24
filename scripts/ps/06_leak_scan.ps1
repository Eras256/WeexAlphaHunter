<#
.SYNOPSIS
    Security Leak Scanner
    Prevents accidental leak of keys in git or artifacts.
#>

$Patterns = @(
    "sk-ant",      # Anthropic
    "AIza",        # Google
    "xoxb-",       # Slack
    "ghp_",        # GitHub
    "-----BEGIN RSA PRIVATE KEY-----"
)

$RiskyFiles = @(".env", ".p12", ".pem", ".key")

Write-Host "Running Security Scan..." -ForegroundColor Cyan
$Fail = $false

# 1. Check for forbidden files in git index
$files = git ls-files
foreach ($rf in $RiskyFiles) {
    if ($files -contains $rf) {
        Write-Host "[FAIL] Forbidden file tracked in git: $rf" -ForegroundColor Red
        $Fail = $true
    }
}

# 2. Grep for patterns in staged files
$staged = git diff --name-only --cached
if ($staged) {
    foreach ($file in $staged) {
        $content = Get-Content $file -Raw
        foreach ($pat in $Patterns) {
            if ($content -match $pat) {
                Write-Host "[FAIL] Potential secret found in $file ($pat)" -ForegroundColor Red
                $Fail = $true
            }
        }
    }
}

if ($Fail) {
    Write-Host "Security Scan Failed. Do not commit." -ForegroundColor Red
    exit 1
}
else {
    Write-Host "Security Scan Passed." -ForegroundColor Green
    exit 0
}
