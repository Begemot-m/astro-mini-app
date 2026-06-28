# deploy.ps1 — обновляет фронт (GitHub Pages) и функции (Supabase) ОДНОЙ командой.
# Запуск:  .\deploy.ps1            (фронт + все функции)
#          .\deploy.ps1 interpret  (фронт + только указанные функции — быстрее)
#
# Перед первым запуском убедись, что включён VPN (для доступа к GitHub).

param([string[]]$Functions)

Set-Location $PSScriptRoot
$ok = $true

function Step($text) { Write-Host "`n=== $text ===" -ForegroundColor Cyan }

# 1. Коммит локальных изменений (если есть)
Step "1/3  Сохранение изменений (git commit)"
git add -A
if (git status --porcelain) {
  git commit -m "update $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
} else {
  Write-Host "  нет новых изменений — пропускаю" -ForegroundColor DarkGray
}

# 2. Публикация фронта на GitHub (триггерит пересборку Pages)
Step "2/3  Публикация фронта (git push)"
git push origin main
if ($LASTEXITCODE -ne 0) {
  Write-Host "  ОШИБКА push. Включён ли VPN? GitHub режется провайдером." -ForegroundColor Red
  $ok = $false
} else {
  Write-Host "  Фронт улетел. Сайт обновится через 1-2 минуты." -ForegroundColor Green
}

# 3. Деплой функций Supabase
Step "3/3  Деплой функций (supabase)"
$all = @(
  "auth-telegram","interpret","save-chart","daily-content",
  "chart-calc","create-payment","cancel-subscription",
  "yookassa-webhook","renew-subscriptions"
)
$target = if ($Functions -and $Functions.Count -gt 0) { $Functions } else { $all }
foreach ($f in $target) {
  if (-not (Test-Path "supabase\functions\$f")) { continue }
  Write-Host "  → $f" -ForegroundColor Yellow
  supabase functions deploy $f --no-verify-jwt
  if ($LASTEXITCODE -ne 0) { Write-Host "    ОШИБКА деплоя $f" -ForegroundColor Red; $ok = $false }
}

Write-Host ""
if ($ok) { Write-Host "ГОТОВО. Закрой мини-апп в Telegram и открой заново." -ForegroundColor Green }
else { Write-Host "Завершено с ошибками — смотри красные строки выше." -ForegroundColor Red }
