param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("claude", "codex", "human")]
    [string]$Agent,

    [Parameter(Mandatory=$true)]
    [string]$Task,

    [switch]$AllowDirty
)

function Convert-ToSlug {
    param([string]$Text)
    $normalized = $Text.ToLowerInvariant()
    $normalized = $normalized -replace 'æ','ae'
    $normalized = $normalized -replace 'ø','o'
    $normalized = $normalized -replace 'å','a'
    $slug = $normalized -replace '[^a-z0-9]+', '-'
    $slug = $slug -replace '^-|-$', ''
    if ($slug.Length -gt 56) {
        $slug = $slug.Substring(0,56).TrimEnd("-")
    }
    return $slug
}

if (-not (Test-Path ".git")) {
    Write-Host "ERROR: Run this from the git repo root." -ForegroundColor Red
    exit 1
}

$current = git branch --show-current
$dirty = git status --porcelain

if ($current -eq "main") {
    Write-Host "Currently on main. Good: new AI work should start from a task branch." -ForegroundColor Cyan
}

if ($dirty -and -not $AllowDirty) {
    Write-Host "ERROR: Working tree is dirty. Commit or stash before creating a new AI task branch." -ForegroundColor Red
    git status --short
    exit 1
}

$date = Get-Date -Format "yyyy-MM-dd"
$slug = Convert-ToSlug $Task
$branch = "$Agent/$date-$slug"

Write-Host "Creating branch: $branch" -ForegroundColor Cyan
git checkout -b $branch

Write-Host ""
Write-Host "Branch created." -ForegroundColor Green
Write-Host ""
Write-Host "Recommended next prompt:"
Write-Host ""

if ($Agent -eq "codex") {
    Write-Host "Read AGENTS.md, AI_HANDOFF.md and AI_DECISION_LOG.md first."
} elseif ($Agent -eq "claude") {
    Write-Host "Read CLAUDE.md, AI_HANDOFF.md and AI_DECISION_LOG.md first."
} else {
    Write-Host "Use AI_HANDOFF.md to document the human task."
}

Write-Host ""
Write-Host "Your task is only:"
Write-Host $Task
Write-Host ""
Write-Host "Do not refactor unrelated code. Run node --test, typecheck and build when relevant. Update AI_HANDOFF.md before finishing."
Write-Host ""
