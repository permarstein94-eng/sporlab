param()

Write-Host ""
Write-Host "=== SPORLAB AI SYSTEM STATUS ===" -ForegroundColor Cyan

if (-not (Test-Path ".git")) {
    Write-Host "ERROR: This does not look like a git repository root." -ForegroundColor Red
    Write-Host "Run this from the root of your SporLab repo."
    exit 1
}

$expectedRepoFiles = @(
    "index.html",
    "content.js",
    "js",
    "tests",
    "README.md",
    "DEPLOY.md",
    "wrangler.jsonc"
)

Write-Host ""
Write-Host "Repo sanity check:" -ForegroundColor Cyan
foreach ($item in $expectedRepoFiles) {
    if (Test-Path $item) {
        Write-Host "OK: $item" -ForegroundColor Green
    } else {
        Write-Host "CHECK: $item not found" -ForegroundColor Yellow
    }
}

$requiredFiles = @(
    "CLAUDE.md",
    "AGENTS.md",
    "AI_HANDOFF.md",
    "AI_DECISION_LOG.md",
    "AI_TASK_TEMPLATE.md"
)

Write-Host ""
Write-Host "AI system files:" -ForegroundColor Cyan
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "OK: $file" -ForegroundColor Green
    } else {
        Write-Host "MISSING: $file" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Branch:" -ForegroundColor Cyan
$branch = git branch --show-current
if ($branch) {
    Write-Host $branch
} else {
    Write-Host "NO CURRENT BRANCH - likely detached HEAD" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Last commit:" -ForegroundColor Cyan
git log -1 --oneline

Write-Host ""
Write-Host "Remote:" -ForegroundColor Cyan
git remote -v

Write-Host ""
Write-Host "Working tree:" -ForegroundColor Cyan
$status = git status --porcelain
if ($status) {
    Write-Host "DIRTY - uncommitted changes exist" -ForegroundColor Yellow
    git status --short
} else {
    Write-Host "CLEAN" -ForegroundColor Green
}

Write-Host ""
Write-Host "Recommended checks for SporLab:" -ForegroundColor Cyan
Write-Host "node --test"
Write-Host "npx -p typescript tsc -p jsconfig.json"
Write-Host "bash build.sh"

Write-Host ""
if ($status) {
    Write-Host "Next safe step: commit or stash before switching agent." -ForegroundColor Yellow
} else {
    Write-Host "Next safe step: create a task branch with scripts/ai-new-task.ps1" -ForegroundColor Green
}
Write-Host ""
