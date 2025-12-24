<#
.SYNOPSIS
    Recursive SHA256 Manifest Generator
#>

param (
    [string]$TargetDir
)

if (-not $TargetDir) { throw "TargetDir is required" }

$Manifest = @{
    "generatedAt" = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    "generator"   = "WAlphaHunter v2.0"
    "files"       = @()
}

$files = Get-ChildItem -Path $TargetDir -Recurse -File

foreach ($f in $files) {
    $hash = Get-FileHash -Path $f.FullName -Algorithm SHA256
    $relativePath = $f.FullName.Substring($TargetDir.Length + 1).Replace("\", "/")
    
    $fileObj = @{
        "path"      = $relativePath
        "sha256"    = $hash.Hash
        "sizeBytes" = $f.Length
    }
    
    $Manifest["files"] += $fileObj
}

$jsonPath = Join-Path $TargetDir "MANIFEST.json"
$Manifest | ConvertTo-Json -Depth 10 | Set-Content -Path $jsonPath

# Create the signature file (SHA256 of the JSON itself)
$jsonHash = Get-FileHash -Path $jsonPath -Algorithm SHA256
$jsonHash.Hash | Set-Content -Path "$jsonPath.sha256"

Write-Host "Manifest created at $jsonPath" -ForegroundColor Gray
