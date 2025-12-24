<#
.SYNOPSIS
    Zip Creator for Proof Kit
#>

param (
    [string]$SourceDir,
    [string]$RunId
)

$ZipPath = "artifacts\proof-kit\WAlphaHunter_Submission_$RunId.zip"

if (Test-Path $ZipPath) { Remove-Item $ZipPath -Force }

Write-Host "Compressing $SourceDir -> $ZipPath" -ForegroundColor Gray

Compress-Archive -Path "$SourceDir\*" -DestinationPath $ZipPath -CompressionLevel Optimal

Write-Host "Zip Created ($((Get-Item $ZipPath).Length / 1MB) MB)" -ForegroundColor Green
