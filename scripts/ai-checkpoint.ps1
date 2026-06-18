param(
    [Parameter(Mandatory=$true)]
    [string]$Message,

    [switch]$SkipChecks
)

if (-not (Test-Path ".git")) {
    Write-Host "ERROR: Run this from the git repo root." -ForegroundColor Red
    exit 1
}

$branch = git branch --show-current
if ($branch -eq "main") {
    Write-Host "WARNING: You are on main. Checkpoint commits for AI work should normally be on a task branch." -ForegroundColor Yellow
}

$status = git status --porcelain
if (-not $status) {
    Write-Host "No changes to checkpoint." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Current changes:" -ForegroundColor Cyan
git status --short

if (-not $SkipChecks) {
    Write-Host ""
    Write-Host "Running recommended checks..." -ForegroundColor Cyan

    Write-Host ""
    Write-Host "1/3 node --test" -ForegroundColor Cyan
    node --test
    if ($LASTEXITCODE -ne 0) {
        Write-Host "node --test failed. Fix or rerun with -SkipChecks if this is expected and documented." -ForegroundColor Red
        exit $LASTEXITCODE
    }

    Write-Host ""
    Write-Host "2/3 npx -p typescript tsc -p jsconfig.json" -ForegroundColor Cyan
    npx -p typescript tsc -p jsconfig.json
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Typecheck failed. Fix or rerun with -SkipChecks if this is expected and documented." -ForegroundColor Red
        exit $LASTEXITCODE
    }

    Write-Host ""
    Write-Host "3/3 bash build.sh" -ForegroundColor Cyan
    bash build.sh
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Build failed. Fix or rerun with -SkipChecks if this is expected and documented." -ForegroundColor Red
        exit $LASTEXITCODE
    }
} else {
    Write-Host "Skipping checks by request. Make sure AI_HANDOFF.md documents why." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Creating checkpoint commit..." -ForegroundColor Cyan
git add .
git commit -m $Message

Write-Host ""
Write-Host "Checkpoint complete." -ForegroundColor Green
git log -1 --oneline
