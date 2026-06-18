param(
    [string]$BaseBranch = "main"
)

if (-not (Test-Path ".git")) {
    Write-Host "ERROR: Run this from the git repo root." -ForegroundColor Red
    exit 1
}

$branch = git branch --show-current

Write-Host ""
Write-Host "=== AI REVIEW PREP ===" -ForegroundColor Cyan
Write-Host "Current branch: $branch"
Write-Host "Base branch: $BaseBranch"

Write-Host ""
Write-Host "Working tree:" -ForegroundColor Cyan
$status = git status --porcelain
if ($status) {
    Write-Host "DIRTY - review may include uncommitted changes" -ForegroundColor Yellow
    git status --short
} else {
    Write-Host "CLEAN" -ForegroundColor Green
}

Write-Host ""
Write-Host "Commits not in $BaseBranch:" -ForegroundColor Cyan
git log --oneline "$BaseBranch..HEAD"

Write-Host ""
Write-Host "Changed files:" -ForegroundColor Cyan
git diff --name-status "$BaseBranch...HEAD"

Write-Host ""
Write-Host "Diff summary:" -ForegroundColor Cyan
git diff --stat "$BaseBranch...HEAD"

Write-Host ""
Write-Host "Paste this prompt into Claude Code:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Read CLAUDE.md, AI_HANDOFF.md and AI_DECISION_LOG.md first."
Write-Host "Review the current branch changes against $BaseBranch."
Write-Host "Do not edit yet."
Write-Host "Check for regressions, unrelated changes, overengineering, style drift, missing tests, service-worker risks, localStorage migration risks and deployment risks."
Write-Host "Return: Must fix, Should fix, Nice to have, Safe to merge yes/no, Recommended next command."
Write-Host ""
