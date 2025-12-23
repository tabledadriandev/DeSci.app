# PowerShell script to replace $TA with $tabledadrian
# Usage: .\scripts\replace-token-name.ps1 [-DryRun]

param(
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

# Directories to exclude
$ExcludeDirs = @(
    "node_modules",
    ".git",
    ".next",
    "dist",
    "build",
    ".cache",
    "coverage",
    ".turbo",
    "scripts"
)

# File extensions to process
$IncludeExtensions = @(
    ".ts", ".tsx", ".js", ".jsx", ".json", 
    ".md", ".txt", ".css", ".html"
)

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$ChangedFiles = @()
$TotalReplacements = 0
$TotalFiles = 0

Write-Host "🔍 Searching for `$TA references...`n" -ForegroundColor Cyan

if ($DryRun) {
    Write-Host "⚠️  DRY RUN MODE - No files will be modified`n" -ForegroundColor Yellow
}

function Should-ProcessFile {
    param([string]$FilePath)
    
    $ext = [System.IO.Path]::GetExtension($FilePath)
    if (-not ($IncludeExtensions -contains $ext)) {
        return $false
    }
    
    # Check if in excluded directory
    $parts = $FilePath.Split([IO.Path]::DirectorySeparatorChar)
    foreach ($part in $parts) {
        if ($ExcludeDirs -contains $part) {
            return $false
        }
    }
    
    return $true
}

function Process-File {
    param([string]$FilePath)
    
    try {
        $content = Get-Content -Path $FilePath -Raw -Encoding UTF8
        $newContent = $content
        $fileReplacements = 0
        
        # Replace patterns
        $patterns = @(
            @{ Pattern = '\$TA\b'; Replacement = '`$tabledadrian' },
            @{ Pattern = '"\$TA"'; Replacement = '"`$tabledadrian"' },
            @{ Pattern = '''\$TA'''; Replacement = '''`$tabledadrian''' },
            @{ Pattern = '`\$TA`'; Replacement = '`$tabledadrian`' },
            @{ Pattern = '\$TA token'; Replacement = '`$tabledadrian token' },
            @{ Pattern = '\$TA tokens'; Replacement = '`$tabledadrian tokens' },
            @{ Pattern = '// \$TA'; Replacement = '// `$tabledadrian' },
            @{ Pattern = '/\* \$TA'; Replacement = '/* `$tabledadrian' },
            @{ Pattern = '\*\*\$TA\*\*'; Replacement = '**`$tabledadrian**' },
            @{ Pattern = '# \$TA'; Replacement = '# `$tabledadrian' }
        )
        
        foreach ($pattern in $patterns) {
            $matches = [regex]::Matches($newContent, $pattern.Pattern, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
            if ($matches.Count -gt 0) {
                $fileReplacements += $matches.Count
                $newContent = $newContent -replace $pattern.Pattern, $pattern.Replacement
            }
        }
        
        if ($fileReplacements -gt 0) {
            $script:TotalReplacements += $fileReplacements
            $script:ChangedFiles += @{
                Path = $FilePath
                Replacements = $fileReplacements
            }
            
            if (-not $DryRun) {
                Set-Content -Path $FilePath -Value $newContent -Encoding UTF8 -NoNewline
                Write-Host "✓ $FilePath ($fileReplacements replacements)" -ForegroundColor Green
            } else {
                Write-Host "[DRY RUN] $FilePath ($fileReplacements replacements)" -ForegroundColor Yellow
            }
        }
    } catch {
        Write-Host "Error processing $FilePath : $_" -ForegroundColor Red
    }
}

function Walk-Directory {
    param(
        [string]$Dir,
        [scriptblock]$Callback
    )
    
    $items = Get-ChildItem -Path $Dir -Force
    
    foreach ($item in $items) {
        if ($item.PSIsContainer) {
            if ($ExcludeDirs -notcontains $item.Name) {
                Walk-Directory -Dir $item.FullName -Callback $Callback
            }
        } else {
            if (Should-ProcessFile -FilePath $item.FullName) {
                & $Callback $item.FullName
                $script:TotalFiles++
            }
        }
    }
}

# Process files
Walk-Directory -Dir $ProjectRoot -Callback { Process-File -FilePath $args[0] }

# Summary
Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "   Files scanned: $TotalFiles"
Write-Host "   Files changed: $($ChangedFiles.Count)"
Write-Host "   Total replacements: $TotalReplacements"

if ($DryRun) {
    Write-Host "`n⚠️  This was a dry run. Run without -DryRun to apply changes." -ForegroundColor Yellow
} elseif ($ChangedFiles.Count -gt 0) {
    Write-Host "`n✅ Replacement complete!" -ForegroundColor Green
    Write-Host "`nChanged files:" -ForegroundColor Cyan
    foreach ($file in $ChangedFiles) {
        Write-Host "   $($file.Path) ($($file.Replacements) replacements)"
    }
} else {
    Write-Host "`n✅ No `$TA references found to replace." -ForegroundColor Green
}

