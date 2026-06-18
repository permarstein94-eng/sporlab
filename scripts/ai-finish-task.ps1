param(
    [string]$BaseBranch = "main",
    [switch]$SkipChecks
)

if (-not (Test-Path ".git")) {
    Write-Host "ERROR: Run this from the git repo root." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== FINISH AI TASK ===" -ForegroundColor Cyan

$branch = git branch --show-current
Write-Host "Current branch: $branch"

if ($branch -eq "main") {
    Write-Host "WARNING: You are on main. AI tasks should normally finish on a task branch." -ForegroundColor Yellow
}

$status = git status --porcelain
if ($status) {
    Write-Host ""
    Write-Host "Uncommitted changes:" -ForegroundColor Yellow
    git status --short
    Write-Host ""
    Write-Host "You should update AI_HANDOFF.md and make a checkpoint commit before merging." -ForegroundColor Yellow
} else {
    Write-Host "Working tree clean." -ForegroundColor Green
}

if (-not $SkipChecks) {
    Write-Host ""
    Write-Host "Running final checks..." -ForegroundColor Cyan

    Write-Host ""
    Write-Host "1/3 node --test" -ForegroundColor Cyan
    node --test
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    Write-Host ""
    Write-Host "2/3 npx -p typescript tsc -p jsconfig.json" -ForegroundColor Cyan
    npx -p typescript tsc -p jsconfig.json
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    Write-Host ""
    Write-Host "3/3 bash build.sh" -ForegroundColor Cyan
    bash build.sh
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} else {
    Write-Host "Skipping final checks by request." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Changed files compared to $BaseBranch:" -ForegroundColor Cyan
git diff --name-status "$BaseBranch...HEAD"

Write-Host ""
Write-Host "Final checklist:" -ForegroundColor Cyan
Write-Host "[ ] AI_HANDOFF.md updated"
Write-Host "[ ] AI_DECISION_LOG.md updated if needed"
Write-Host "[ ] Checks passed or failures documented"
Write-Host "[ ] Claude review completed if Codex implemented"
Write-Host "[ ] Branch ready for PR/merge"
Write-Host ""
