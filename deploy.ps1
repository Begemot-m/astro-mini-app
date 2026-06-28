# deploy.ps1 - push frontend (GitHub Pages) and deploy Supabase functions in one command.
# Usage:  .\deploy.ps1            (frontend + all functions)
#         .\deploy.ps1 interpret  (frontend + only listed functions, faster)
# Turn on VPN before running (GitHub access).

param([string[]]$Functions)

Set-Location $PSScriptRoot
$ok = $true

Write-Host ""
Write-Host "=== 1/3  git commit ===" -ForegroundColor Cyan
git add -A
if (git status --porcelain) {
    git commit -m ("update " + (Get-Date -Format "yyyy-MM-dd HH:mm"))
} else {
    Write-Host "  no local changes - skip" -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "=== 2/3  git push (frontend) ===" -ForegroundColor Cyan
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "  PUSH FAILED. Is VPN on? GitHub may be blocked by ISP." -ForegroundColor Red
    $ok = $false
} else {
    Write-Host "  Frontend pushed. Pages will rebuild in 1-2 min." -ForegroundColor Green
}

Write-Host ""
Write-Host "=== 3/3  supabase functions deploy ===" -ForegroundColor Cyan
$all = @(
    "auth-telegram","interpret","save-chart","daily-content",
    "chart-calc","create-payment","cancel-subscription",
    "yookassa-webhook","renew-subscriptions"
)
if ($Functions -and $Functions.Count -gt 0) { $target = $Functions } else { $target = $all }
foreach ($f in $target) {
    if (-not (Test-Path ("supabase\functions\" + $f))) { continue }
    Write-Host ("  -> " + $f) -ForegroundColor Yellow
    supabase functions deploy $f --no-verify-jwt
    if ($LASTEXITCODE -ne 0) {
        Write-Host ("     DEPLOY FAILED: " + $f) -ForegroundColor Red
        $ok = $false
    }
}

Write-Host ""
if ($ok) {
    Write-Host "DONE. Close the mini app in Telegram and open it again." -ForegroundColor Green
} else {
    Write-Host "Finished with errors - see red lines above." -ForegroundColor Red
}
