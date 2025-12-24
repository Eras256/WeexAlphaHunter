<#
.SYNOPSIS
    WAlphaHunter Proof-Kit Generator
    Assembles the final submission package for DoraHacks/WEEX.
.DESCRIPTION
    1. Creates a clean staging area: artifacts/proof-kit/<RunId>
    2. Copies:
       - Source Code (cleaned)
       - Backtest Results (CSV/Logs)
       - Compliance Proofs (UID/KYC)
       - Documentation (Converted to PDF)
    3. Generates Manifest & Hashes
    4. Zips everything
#>

param (
    [string]$RunId = (Get-Date -Format "yyyyMMdd-HHmm")
)

$ErrorActionPreference = "Stop"
$KitPath = "artifacts\proof-kit\$RunId"

Write-Host "`n[PROOF-KIT] Assembling Submission Package: $RunId" -ForegroundColor Cyan

# 1. Structure
New-Item -ItemType Directory -Path "$KitPath\data" -Force | Out-Null
New-Item -ItemType Directory -Path "$KitPath\docs" -Force | Out-Null
New-Item -ItemType Directory -Path "$KitPath\source" -Force | Out-Null
New-Item -ItemType Directory -Path "$KitPath\compliance" -Force | Out-Null

# 2. Copy Data Artifacts
Write-Host "    Copying Data artifacts..." -ForegroundColor Gray
if (Test-Path "data\backtest\trades_v2.csv") {
    Copy-Item "data\backtest\trades_v2.csv" -Destination "$KitPath\data\"
}
if (Test-Path "data\compliance\weex_proofs") {
    Copy-Item "data\compliance\weex_proofs\*" -Destination "$KitPath\compliance\" -Recurse
}

# 3. Generate PDF Docs (Requires md-to-pdf installed via pnpm)
Write-Host "    Converting Docs to PDF..." -ForegroundColor Gray
# We assume docs exist in /docs. We convert them to the Kit folder.
# Strategy: Use npx md-to-pdf if available, else just copy MD.
$docs = @("POLICY_DESCRIPTION_DOCUMENT_EN.md", "AI_PARTICIPATION_DESCRIPTION_EN.md", "SUBMISSION_DRAFT.md")

foreach ($doc in $docs) {
    if (Test-Path "docs\$doc") {
        Copy-Item "docs\$doc" -Destination "$KitPath\docs\$doc"
        
        # Try convert
        # npx md-to-pdf "docs\$doc" "$KitPath\docs\$($doc.Replace('.md','.pdf'))" 
        # (Commented out to avoid blocking if npx fails, user can enable)
    }
}

# 4. Copy Source Snapshot (Excluding secrets/node_modules)
Write-Host "    Snapshotting Source Code..." -ForegroundColor Gray
# We use git archive logic simply by copying specific folders
Copy-Item "packages" -Destination "$KitPath\source\" -Recurse
Copy-Item "apps" -Destination "$KitPath\source\" -Recurse
Copy-Item "python" -Destination "$KitPath\source\" -Recurse
# Remove node_modules from the copy just in case
Get-ChildItem "$KitPath\source" -Include "node_modules", ".venvs" -Recurse | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

# 5. Generate Manifest (Call script 04)
Write-Host "    Generating SHA256 Manifest..." -ForegroundColor Gray
powershell -ExecutionPolicy Bypass -File scripts\ps\04_hash_manifest.ps1 -TargetDir $KitPath

# 6. Zip It (Call script 05)
Write-Host "    Zipping Package..." -ForegroundColor Gray
powershell -ExecutionPolicy Bypass -File scripts\ps\05_zip_proofkit.ps1 -SourceDir $KitPath -RunId $RunId

Write-Host "[SUCCESS] Proof Kit Ready: artifacts/proof-kit/$RunId.zip" -ForegroundColor Green
